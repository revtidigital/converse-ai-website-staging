import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pricingPlans, type PricingPlan } from "@/data/pricingPlans";
import type { Tables } from "@/integrations/supabase/types";

type PricingPlanRow = Tables<"pricing_plans">;

function rowToPricingPlan(row: PricingPlanRow): PricingPlan {
  return {
    id: row.id,
    name: row.name,
    monthlyPrice: row.monthly_price,
    yearlyPrice: row.yearly_price,
    description: row.description,
    features: row.features,
    popular: row.popular,
    displayOrder: row.display_order,
  };
}

export function usePricingPlans() {
  const [data, setData] = useState<PricingPlan[]>(pricingPlans);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      const { data: rows, error: err } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("display_order", { ascending: true });

      if (cancelled) return;
      if (err) {
        setError(err.message);
      } else {
        setData((rows ?? []).map(rowToPricingPlan));
      }
      setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
