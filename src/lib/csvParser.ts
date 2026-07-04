/** Lightweight CSV parser — handles quoted fields, CRLF/LF, nested commas */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = splitCSVLines(text.replace(/\r\n/g, '\n').replace(/\r/g, '\n'));
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map((h) => h.trim());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = (values[idx] ?? '').trim();
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

function parseCSVRow(line: string): string[] {
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
    } else if (ch === ',' && !inQuotes) {
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
