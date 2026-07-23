export class VoiceTiming {
  private start = typeof performance !== "undefined" ? performance.now() : Date.now();
  private marks: Array<[string, number]> = [];
  mark(label: string) {
    if (!import.meta.env.DEV) return;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    this.marks.push([label, Math.round(now - this.start)]);
  }
  flush(scope = "voice") {
    if (!import.meta.env.DEV || !this.marks.length) return;
    console.debug(`[${scope}] timing`, Object.fromEntries(this.marks));
  }
}
