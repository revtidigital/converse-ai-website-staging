export class ConnectionRateLimiter {
  private readonly counts = new Map<string, number>();

  constructor(private readonly maxConnectionsPerIp: number) {}

  tryAcquire(ip: string): boolean {
    const current = this.counts.get(ip) ?? 0;
    if (current >= this.maxConnectionsPerIp) return false;
    this.counts.set(ip, current + 1);
    return true;
  }

  release(ip: string): void {
    const current = this.counts.get(ip) ?? 0;
    if (current <= 1) this.counts.delete(ip);
    else this.counts.set(ip, current - 1);
  }

  current(ip: string): number {
    return this.counts.get(ip) ?? 0;
  }
}
