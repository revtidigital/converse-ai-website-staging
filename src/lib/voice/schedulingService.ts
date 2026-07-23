export interface SchedulingDraft { name?: string; email?: string; timezone?: string; preferredDate?: string; preferredTime?: string; purpose?: string; }
export interface SchedulingService { hasRealAvailability(): boolean; getSchedulingUrl(): string; lookupAvailability(draft: SchedulingDraft): Promise<string[]>; schedule(draft: SchedulingDraft, slot: string): Promise<{ ok: boolean; message: string }>; }

export const schedulingService: SchedulingService = {
  hasRealAvailability: () => false,
  getSchedulingUrl: () => "/book-demo",
  async lookupAvailability() { return []; },
  async schedule() { return { ok: false, message: "A live calendar booking API is not configured yet. I can take you to the demo request page, but I won't claim a slot is booked until a real backend confirms it." }; },
};
