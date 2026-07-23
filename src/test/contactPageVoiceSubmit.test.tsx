import { act, render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactUs from "@/pages/ContactUs";

vi.mock("@/lib/submitContactForm", () => ({ submitContactForm: vi.fn(async () => undefined) }));
vi.mock("@/lib/recaptcha", () => ({ getCaptchaToken: vi.fn(async () => "") }));
vi.mock("@/lib/tracking", () => ({
  trackFormError: vi.fn(),
  trackFormStart: vi.fn(),
  trackFormSubmitClick: vi.fn(),
  trackFormSuccess: vi.fn(),
  trackFormView: vi.fn(),
}));
vi.mock("@/lib/usePartialLeadCapture", () => ({ usePartialLeadCapture: () => vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/components/ui/PhoneInputField", () => ({ default: ({ value, onChange }: { value: string; onChange: (phone: string, countryName: string) => void }) => <input aria-label="Phone Number" value={value} onChange={(e) => onChange(e.target.value, "United States")} /> }));

const renderPage = () => render(<HelmetProvider><MemoryRouter><ContactUs /></MemoryRouter></HelmetProvider>);

describe("ContactUs voice submission bridge", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    class MockResizeObserver { observe() {} unobserve() {} disconnect() {} }
    Object.defineProperty(window, "ResizeObserver", { value: MockResizeObserver, configurable: true });
  });

  it("waits for agreeToTerms state before submitting and ignores duplicate voice submit events", async () => {
    const requestSubmit = vi.spyOn(HTMLFormElement.prototype, "requestSubmit").mockImplementation(function (this: HTMLFormElement) {
      this.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    renderPage();

    act(() => {
      window.dispatchEvent(new CustomEvent("voice-agent:contact-field", { detail: { field: "name", value: "Jane Doe" } }));
      window.dispatchEvent(new CustomEvent("voice-agent:contact-field", { detail: { field: "email", value: "jane@example.com" } }));
      window.dispatchEvent(new CustomEvent("voice-agent:contact-field", { detail: { field: "phone", value: "+14155552671" } }));
      window.dispatchEvent(new CustomEvent("voice-agent:contact-field", { detail: { field: "product", value: "ai-agent" } }));
      window.dispatchEvent(new CustomEvent("voice-agent:contact-submit-request"));
      window.dispatchEvent(new CustomEvent("voice-agent:contact-submit-request"));
    });

    await waitFor(() => expect(requestSubmit).toHaveBeenCalledTimes(1));
  });
});
