/** Auto-detects the delimiter of a CSV/TSV file (comma, semicolon, or tab) */
function detectDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (semicolonCount > commaCount && semicolonCount > tabCount) {
    return ';';
  }
  if (tabCount > commaCount && tabCount > semicolonCount) {
    return '\t';
  }
  return ',';
}

/** Lightweight CSV parser — handles BOM, auto-detects delimiter, quotes, CRLF/LF */
export function parseCSV(text: string): Record<string, string>[] {
  // Strip UTF-8 BOM if present
  const cleanText = text.replace(/^\ufeff/, "").replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const lines = splitCSVLines(cleanText);
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCSVRow(lines[0], delimiter).map((h) => h.trim());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVRow(line, delimiter);
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      // Remove wrapping quotes from values if present
      let val = (values[idx] ?? '').trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      obj[header] = val;
    });
    results.push(obj);
  }
  return results;
}

function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += ch;
      }
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function parseCSVRow(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values;
}

/** Validates that all required columns are present in parsed CSV headers */
export function validateCSVColumns(
  rows: Record<string, string>[],
  required: string[]
): { valid: boolean; missing: string[]; present: string[] } {
  if (rows.length === 0) return { valid: false, missing: required, present: [] };
  const headers = Object.keys(rows[0]);
  const missing = required.filter((col) => !headers.includes(col));
  const present = required.filter((col) => headers.includes(col));
  return { valid: missing.length === 0, missing, present };
}
