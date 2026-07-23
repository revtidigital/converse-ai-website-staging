type ApiHeaderValue = string | string[] | undefined;
type ApiRequest = { headers: Record<string, ApiHeaderValue> };
type ApiResponse = { setHeader(name: string, value: string): void; json(body: unknown): unknown };


export default function handler(req: ApiRequest, res: ApiResponse) {
  const country =
    (req.headers["x-vercel-ip-country"] as string) ||
    (req.headers["cf-ipcountry"] as string) ||
    "IN";

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  res.json({ country: country.toUpperCase() });
}
