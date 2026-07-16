import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { FileText, FilePlus2, BookOpen, CreditCard, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
  publishedPosts: number;
  draftPosts: number;
  caseStudies: number;
  pricingPlans: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      setError(null);
      const [published, draft, caseStudies, pricingPlans] = await Promise.all([
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published").is("deleted_at", null),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "draft").is("deleted_at", null),
        supabase.from("case_studies").select("id", { count: "exact", head: true }),
        supabase.from("pricing_plans").select("id", { count: "exact", head: true }),
      ]);

      if (cancelled) return;

      const firstError = published.error || draft.error || caseStudies.error || pricingPlans.error;
      if (firstError) {
        setError(firstError.message);
      } else {
        setStats({
          publishedPosts: published.count ?? 0,
          draftPosts: draft.count ?? 0,
          caseStudies: caseStudies.count ?? 0,
          pricingPlans: pricingPlans.count ?? 0,
        });
      }
      setLoading(false);
    }

    loadStats();
    return () => { cancelled = true; };
  }, []);

  const cards = stats
    ? [
        { label: "Published Posts", value: stats.publishedPosts, icon: FileText, href: "/admin/blog", color: "text-green-600 bg-green-50" },
        { label: "Draft Posts", value: stats.draftPosts, icon: FilePlus2, href: "/admin/blog", color: "text-amber-600 bg-amber-50" },
        { label: "Case Studies", value: stats.caseStudies, icon: BookOpen, href: "/admin/case-studies", color: "text-violet-600 bg-violet-50" },
        { label: "Pricing Plans", value: stats.pricingPlans, icon: CreditCard, href: "/admin/pricing", color: "text-blue-600 bg-blue-50" },
      ]
    : [];

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Quick overview of your site content.</p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            Failed to load dashboard stats: {error}
          </div>
        )}

        {!loading && !error && stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <Link
                key={card.label}
                to={card.href}
                className="group rounded-xl border border-border/60 bg-white p-5 transition-all hover:border-violet-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", card.color)}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-4 text-3xl font-bold text-foreground">{card.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminDashboard;
