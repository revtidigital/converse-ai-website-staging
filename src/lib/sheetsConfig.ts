/**
 * Centralized Google Sheet Configuration for Converse AI Staging Environment
 *
 * IMPORTANT:
 * - Production Sheet (1kTHtcW0mhTyxI6thIsHPofiZ2k57H7WGS9Q45LZzuO0): DISCONNECTED on staging.
 * - Staging Sheet (1o7Mh9van52fBRhztLssjr-RZMhzrblwIx8_6NX-FxQQ): Dedicated sheet for staging leads.
 */

export const STAGING_GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1o7Mh9van52fBRhztLssjr-RZMhzrblwIx8_6NX-FxQQ/edit?gid=0#gid=0";

export const STAGING_GOOGLE_SHEET_ID = "1o7Mh9van52fBRhztLssjr-RZMhzrblwIx8_6NX-FxQQ";

/**
 * Webhook URL for the Staging Google Sheet.
 * Reads from VITE_STAGING_SHEET_SCRIPT_URL or VITE_GOOGLE_SHEET_SCRIPT_URL.
 * If not set, it intentionally does NOT fall back to the production sheet.
 */
export const getStagingSheetScriptUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return (
      import.meta.env.VITE_STAGING_SHEET_SCRIPT_URL ||
      import.meta.env.VITE_GOOGLE_SHEET_SCRIPT_URL ||
      ""
    );
  }
  return "";
};
