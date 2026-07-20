import { useRef } from "react";
import { submitContactForm } from "./submitContactForm";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PartialExtra {
  fullName?: string;
  phone?: string;
  countryName?: string;
  product?: string;
}

/**
 * Captures a visitor's email the moment they finish typing it (onBlur), even if
 * they never click Submit — an abandoned/partial lead.
 *
 * It reuses the normal submit pipeline (Google Apps Script) but tags the record
 * as a partial lead. The `send_user_email: "false"` flag tells the Apps Script
 * to notify the admin only and NOT send any email to the visitor.
 *
 * Guarded so the same email is only sent once per session (per form).
 *
 * @param formSource label so partial leads are distinguishable in the sheet.
 */
export function usePartialLeadCapture(formSource: string) {
  const sentFor = useRef<string>("");

  return (email: string, extra?: PartialExtra) => {
    const value = (email || "").trim();
    if (!EMAIL_RE.test(value)) return;
    const key = value.toLowerCase();
    if (sentFor.current === key) return; // already captured this email
    sentFor.current = key;

    submitContactForm({
      fullName: extra?.fullName?.trim() || "Unknown (partial lead)",
      email: value,
      phone: extra?.phone || "",
      countryName: extra?.countryName,
      product: extra?.product || "N/A",
      subject: "Partial Lead (not submitted)",
      message: "Visitor entered their email but did not submit the form.",
      form_source: formSource,
      extraFields: {
        partial_lead: "true",
        // Apps Script: when this is "false", notify admin only, do NOT email the visitor.
        send_user_email: "false",
      },
    }).catch(() => {
      // allow a retry on next blur if the background send failed
      sentFor.current = "";
    });
  };
}
