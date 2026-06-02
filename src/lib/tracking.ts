// ===============================================
// FULL TRACKING UTILITY
// Works with Lovable + React + GA4 + Meta Pixel
// ===============================================

const DEBUG = false;

type TrackingValue = string | number | boolean | undefined;
type TrackingParams = Record<string, TrackingValue>;

const SCROLL_THRESHOLDS = [25, 50, 75] as const;
let scrollTrackingInitialized = false;
let autoCtaTrackingInitialized = false;
let errorTrackingInitialized = false;

// ---------- GLOBAL TYPES ----------
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const getPageParams = (): TrackingParams => {
  if (typeof window === "undefined") return {};

  return {
    page_path: window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
  };
};

const cleanParams = (params?: TrackingParams): TrackingParams | undefined => {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  ) as TrackingParams;
};

// ---------- CORE EVENT ----------
export function trackEvent(eventName: string, params?: TrackingParams) {
  const payload = cleanParams({ ...getPageParams(), ...params });

  if (DEBUG) console.log("[TRACK]", eventName, payload);

  // GA4
  if (typeof window !== "undefined" && window.gtag) {
    try {
      window.gtag("event", eventName, payload);
    } catch (e) {
      console.error("GA4 Error:", e);
    }
  }

  // META
  if (typeof window !== "undefined" && window.fbq) {
    try {
      window.fbq("trackCustom", eventName, payload);
    } catch (e) {
      console.error("Meta Pixel Error:", e);
    }
  }
}

// ---------- PAGE VIEW ----------
export function trackPageView(path: string, title: string) {
  trackEvent("page_view", { page_path: path, page_title: title });

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
}

// ---------- CTA / BUTTON CLICK ----------
export function trackCtaClick(
  ctaText: string,
  params?: TrackingParams & { cta_url?: string; cta_location?: string }
) {
  trackEvent("cta_click", {
    event_category: "engagement",
    cta_text: ctaText,
    cta_url: params?.cta_url,
    cta_location: params?.cta_location,
    ...params,
  });
}

export function trackButtonClick(buttonName: string) {
  trackCtaClick(buttonName, { cta_location: "manual_button_click" });
}

// ---------- FORM ----------
export function trackFormView(form: string, params?: TrackingParams) {
  trackEvent("form_view", {
    event_category: "lead",
    form_name: form,
    ...params,
  });
}

export function trackFormStart(form: string, params?: TrackingParams) {
  trackEvent("form_start", {
    event_category: "lead",
    form_name: form,
    ...params,
  });
}

export function trackFormSuccess(form: string, params?: TrackingParams) {
  trackEvent("form_submit", {
    event_category: "lead",
    form_name: form,
    event_label: form,
    ...params,
  });

  // Meta Pixel Lead event
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", { form, ...params });
  }
}

export function trackFormError(form: string, error: string, params?: TrackingParams) {
  trackEvent("form_error", {
    event_category: "lead",
    form_name: form,
    error,
    ...params,
  });
}

// ---------- WHATSAPP ----------
export function trackWhatsAppClick() {
  trackEvent("whatsapp_click", {
    event_category: "engagement",
    location: typeof window !== "undefined" ? window.location.pathname : undefined,
  });
}

// ---------- SCROLL ----------
export function initScrollTracking() {
  if (typeof window === "undefined" || scrollTrackingInitialized) return;

  scrollTrackingInitialized = true;
  const firedThresholds = new Set<string>();

  window.addEventListener(
    "scroll",
    () => {
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollableHeight = documentHeight - viewportHeight;

      if (scrollableHeight <= 0) return;

      const scrollPercent = Math.round(
        ((window.scrollY + viewportHeight) / documentHeight) * 100
      );
      const path = window.location.pathname;

      SCROLL_THRESHOLDS.forEach((threshold) => {
        const key = `${path}:${threshold}`;
        if (scrollPercent >= threshold && !firedThresholds.has(key)) {
          trackEvent(`scroll_${threshold}`, {
            event_category: "engagement",
            percent_scrolled: threshold,
          });
          firedThresholds.add(key);
        }
      });
    },
    { passive: true }
  );
}

// ---------- AUTO CTA TRACKING ----------
// Fires for actionable <a> and <button> clicks, including dialog triggers and nav CTAs.
export function initAutoButtonTracking() {
  if (typeof window === "undefined" || autoCtaTrackingInitialized) return;

  autoCtaTrackingInitialized = true;

  document.addEventListener("click", (e) => {
    const el = e.target as HTMLElement;
    if (!el) return;

    const cta = el.closest("button, a") as HTMLElement | null;
    if (!cta) return;

    if (cta.classList.contains("no-track") || cta.getAttribute("data-track") === "false") return;

    if (cta.hasAttribute("disabled") || (cta as HTMLButtonElement).disabled) return;

    const tag = cta.tagName.toLowerCase();
    const href = tag === "a" ? cta.getAttribute("href") || "" : undefined;

    if (tag === "a") {
      if (!href || href === "#" || href === "javascript:void(0)") return;
      if (href.startsWith("#") && !cta.getAttribute("data-track")) return;
    }

    if (tag === "button") {
      const type = (cta.getAttribute("type") || "button").toLowerCase();
      const isSubmit = type === "submit";
      const hasExplicitTrack = cta.hasAttribute("data-track") || cta.hasAttribute("data-action");
      const opensDialog = cta.getAttribute("aria-haspopup") === "dialog";
      const insideLink = !!cta.closest("a[href]");

      if (isSubmit || (!hasExplicitTrack && !opensDialog && !insideLink)) return;
    }

    const text =
      cta.getAttribute("data-track-label") ||
      cta.getAttribute("aria-label") ||
      cta.getAttribute("title") ||
      cta.innerText?.trim() ||
      "";

    const label = text.replace(/\s+/g, " ").trim().slice(0, 100);
    if (!label) return;

    trackCtaClick(label, {
      cta_url: href,
      cta_location: cta.getAttribute("data-track-location") || tag,
    });
  });
}

export function initTracking() {
  initScrollTracking();
  initAutoButtonTracking();
  initErrorTracking();
}

// ---------- ERROR TRACKING ----------
export function initErrorTracking() {
  if (typeof window === "undefined" || errorTrackingInitialized) return;

  errorTrackingInitialized = true;

  window.addEventListener("error", (e) => {
    trackEvent("js_error", { message: e.message });
  });
}

// ---------- TEST ----------
export function testTracking() {
  trackEvent("test_event", { test: true });
}
