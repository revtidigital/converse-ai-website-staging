// ===============================================
// FULL TRACKING UTILITY
// Works with Lovable + React + GA4 + Meta Pixel
// ===============================================

const DEBUG = false;

type TrackingValue = string | number | boolean | undefined;
type TrackingParams = Record<string, TrackingValue>;
type GtagOptions = {
  event_callback?: () => void;
  event_timeout?: number;
  send_to?: string;
  transport_type?: "beacon" | "xhr" | "image";
};
type GtagEventParams = TrackingParams & GtagOptions;

const SCROLL_THRESHOLDS = [25, 50, 75] as const;
let scrollTrackingInitialized = false;
let autoCtaTrackingInitialized = false;
let autoFormTrackingInitialized = false;
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
export function trackEvent(eventName: string, params?: TrackingParams, gtagOptions?: GtagOptions) {
  const payload = cleanParams({ ...getPageParams(), ...params });
  const gtagPayload: GtagEventParams | undefined = payload
    ? { ...payload, ...gtagOptions }
    : (gtagOptions as GtagEventParams | undefined);

  if (DEBUG) console.log("[TRACK]", eventName, gtagPayload);

  // GA4
  if (typeof window !== "undefined" && window.gtag) {
    try {
      window.gtag("event", eventName, gtagPayload);
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

export function trackFormSubmitClick(form: string, params?: TrackingParams) {
  trackEvent("form_submit_click", {
    event_category: "lead",
    form_name: form,
    event_label: form,
    ...params,
  });
}

export function trackFormFilled(form: string, params?: TrackingParams) {
  trackEvent("form_filled", {
    event_category: "lead",
    form_name: form,
    event_label: form,
    ...params,
  }, {
    transport_type: "beacon",
    event_timeout: 2000,
  });
}

export function trackFormSuccess(form: string, params?: TrackingParams) {
  trackFormFilled(form, params);

  trackEvent("form_submit", {
    event_category: "lead",
    form_name: form,
    event_label: form,
    value: 1,
    ...params,
  }, {
    transport_type: "beacon",
    event_timeout: 2000,
  });

  trackEvent("generate_lead", {
    event_category: "lead",
    form_name: form,
    event_label: form,
    value: 1,
    ...params,
  }, {
    transport_type: "beacon",
    event_timeout: 2000,
  });

  // Meta Pixel Lead event
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Lead", { form, ...params });
  }
}

const getFormFieldStats = (form: HTMLFormElement): TrackingParams => {
  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea"
    )
  ).filter((field) => {
    if (!field.name && !field.id) return false;
    if (field.type === "hidden" || field.type === "submit" || field.type === "button") return false;
    return !field.disabled;
  });

  const filledFields = fields.filter((field) => {
    if (field instanceof HTMLInputElement && (field.type === "checkbox" || field.type === "radio")) {
      return field.checked;
    }

    return field.value.trim() !== "";
  });

  return {
    field_count: fields.length,
    filled_field_count: filledFields.length,
  };
};

const getFormName = (form: HTMLFormElement): string => {
  const explicitName =
    form.getAttribute("data-ga-form-name") ||
    form.getAttribute("data-track-form") ||
    form.getAttribute("aria-label") ||
    form.getAttribute("name") ||
    form.id;

  if (explicitName) return explicitName.replace(/\s+/g, "_").toLowerCase();

  const heading = form.closest("section, main, div")?.querySelector("h1, h2, h3")?.textContent?.trim();
  if (heading) return heading.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").toLowerCase();

  return "website_form";
};

// ---------- AUTO FORM TRACKING ----------
// Fallback coverage for any current or future public website form that is not manually instrumented.
export function initAutoFormTracking() {
  if (typeof window === "undefined" || autoFormTrackingInitialized) return;

  autoFormTrackingInitialized = true;

  document.addEventListener("submit", (event) => {
    if (window.location.pathname.startsWith("/admin")) return;

    const form = event.target as HTMLFormElement | null;
    if (!form || form.tagName.toLowerCase() !== "form") return;
    if (form.getAttribute("data-track") === "false") return;

    const formName = getFormName(form);
    const params = {
      form_location: form.getAttribute("data-track-location") || window.location.pathname,
      auto_tracked: true,
      ...getFormFieldStats(form),
    };

    trackFormSubmitClick(formName, params);
    trackFormFilled(formName, params);
  });
}

export function trackThankYouPage(params?: TrackingParams) {
  trackEvent("thank_you_page_view", {
    event_category: "lead",
    page_type: "thank_you",
    ...params,
  }, {
    transport_type: "beacon",
  });
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
  initAutoFormTracking();
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
