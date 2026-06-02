import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { caseStudies } from "@/data/caseStudies";
import type { CaseStudy, CaseStudyMetric, CaseStudySection } from "@/data/caseStudies";
import type { Tables } from "@/integrations/supabase/types";

type CaseStudyRow = Tables<"case_studies">;

function rowToCaseStudy(row: CaseStudyRow): CaseStudy {
  return {
    id: row.id,
    slug: row.slug,
    company: row.company,
    industry: row.industry,
    category: row.category,
    tagline: row.tagline,
    excerpt: row.excerpt,
    heroImage: row.hero_image,
    logo: row.logo,
    readTime: row.read_time,
    publishedDate: row.published_date,
    metrics: row.metrics as CaseStudyMetric[],
    challenge: row.challenge,
    solution: row.solution,
    outcome: row.outcome,
    sections: row.sections as CaseStudySection[],
    testimonial: row.testimonial as CaseStudy["testimonial"],
    featuresUsed: row.features_used,
    useCase: row.use_case,
    displayOrder: row.display_order,
  };
}

export function useCaseStudies() {
  const [data, setData] = useState<CaseStudy[]>(caseStudies);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      const { data: rows, error: err } = await supabase
        .from("case_studies")
        .select("*")
        .order("display_order", { ascending: true });

      if (cancelled) return;
      if (err) {
        setError(err.message);
      } else {
        setData((rows ?? []).map(rowToCaseStudy));
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

export function useCaseStudy(slug: string | undefined) {
  const initialCaseStudy = slug ? caseStudies.find((cs) => cs.slug === slug) ?? null : null;
  const [data, setData] = useState<CaseStudy | null>(initialCaseStudy);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      const { data: row, error: err } = await supabase
        .from("case_studies")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;
      if (err) {
        setError(err.message);
      } else {
        setData(row ? rowToCaseStudy(row) : null);
      }
      setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading, error };
}
