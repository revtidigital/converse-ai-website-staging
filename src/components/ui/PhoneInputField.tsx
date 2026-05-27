import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string, countryName: string) => void;
  error?: string;
  variant?: "bordered" | "underline";
  className?: string;
}

const getCountryName = (country: Country | undefined): string => {
  if (!country) return "";
  try {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(country);
    return name || country;
  } catch {
    return country;
  }
};

const detectCountryFromIP = async (): Promise<Country> => {
  try {
    const res = await fetch("https://www.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
    const text = await res.text();
    const match = text.match(/^loc=([A-Z]{2})$/m);
    if (match?.[1]) return match[1] as Country;
  } catch {
    // fallback to IN
  }
  return "IN";
};

const PhoneInputField = ({
  value,
  onChange,
  error,
  variant = "bordered",
  className,
}: PhoneInputFieldProps) => {
  const [defaultCountry, setDefaultCountry] = useState<Country>("IN");

  useEffect(() => {
    detectCountryFromIP().then(setDefaultCountry);
  }, []);

  const handleChange = (val: string | undefined) => {
    onChange(val || "", "");
  };

  const handleCountryChange = (country: Country | undefined) => {
    const name = getCountryName(country);
    onChange(value || "", name);
  };

  return (
    <div className={cn("phone-input-wrapper", variant, className)}>
      <PhoneInput
        key={defaultCountry}
        international
        defaultCountry={defaultCountry}
        value={value}
        onChange={handleChange}
        onCountryChange={handleCountryChange}
        countryCallingCodeEditable={false}
        className={cn("flex items-center w-full", error && "error")}
      />
      {error && (
        <p className="text-xs text-destructive mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default PhoneInputField;
