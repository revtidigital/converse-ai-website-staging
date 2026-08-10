import { z } from "zod";
import {
  SERVICE_INTEREST_OPTIONS,
  BUDGET_RANGE_OPTIONS,
  mapUserLanguageToDropdownId,
} from "../../src/config/assistantConfig";

export const LeadFormFieldsSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  work_email: z.string().email("Valid work email is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  company_name: z.string().optional(),
  service_interest: z.string().min(1, "Service interest is required"),
  budget_range: z.string().optional(),
  message: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: "Explicit user consent is mandatory before saving personal info or submitting form.",
  }),
});

export const FillLeadFormSchema = LeadFormFieldsSchema.partial();

export const CreateBookingSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  work_email: z.string().email("Valid work email is required"),
  phone: z.string().min(7, "Valid phone number is required"),
  service_interest: z.string().min(1, "Service interest is required"),
  preferred_slot: z.string().min(1, "Preferred date/time slot is required"),
  confirmation: z.literal(true, {
    errorMap: () => ({ message: "Explicit final confirmation ('Yes, book it') is mandatory before creating a booking." }),
  }),
  consent: z.literal(true, {
    errorMap: () => ({ message: "User consent is mandatory before booking." }),
  }),
});

export function getMockAvailableSlots(dateRange?: string, timezone: string = "UTC") {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  return [
    { id: "slot_1", datetime: `${dateStr} 10:00 AM`, label: "Tomorrow at 10:00 AM IST", available: true },
    { id: "slot_2", datetime: `${dateStr} 02:00 PM`, label: "Tomorrow at 02:00 PM IST", available: true },
    { id: "slot_3", datetime: `${dateStr} 04:30 PM`, label: "Tomorrow at 04:30 PM IST", available: true },
  ];
}

export function validateAndMapDropdowns(fields: Record<string, any>) {
  const mapped = { ...fields };

  if (mapped.service_interest) {
    const validServiceId = mapUserLanguageToDropdownId(mapped.service_interest, SERVICE_INTEREST_OPTIONS);
    if (validServiceId) {
      mapped.service_interest = validServiceId;
    } else {
      delete mapped.service_interest;
    }
  }

  if (mapped.budget_range) {
    const validBudgetId = mapUserLanguageToDropdownId(mapped.budget_range, BUDGET_RANGE_OPTIONS);
    if (validBudgetId) {
      mapped.budget_range = validBudgetId;
    } else {
      mapped.budget_range = "not_specified";
    }
  }

  return mapped;
}
