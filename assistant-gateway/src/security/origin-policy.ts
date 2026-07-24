export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.includes("*") || allowedOrigins.includes(origin);
}
