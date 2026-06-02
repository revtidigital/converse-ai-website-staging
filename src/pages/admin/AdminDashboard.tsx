import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { useCaseStudies } from "@/hooks/useCaseStudies";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";

const AdminDashboard = () => {
  const { data: caseStudies, loading, error } = useCaseStudies();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error: deleteError } = await supabase.from("case_studies").delete().eq("id", deleteId);
    setDeleting(false);
    setDeleteSlug(null);
    setDeleteId(null);
    if (deleteError) {
      toast({ title: "Delete failed", description: deleteError.message, variant: "destructive" });
    } else {
      toast({ title: "Case study deleted" });
      navigate(0);
    }
  }

  async function handleReorder(index: number, direction: "up" | "down") {
    const sorted = [...caseStudies].sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    setReordering(true);
    const itemA = sorted[index];
    const itemB = sorted[swapIndex];
    const orderA = itemA.displayOrder ?? index + 1;
    const orderB = itemB.displayOrder ?? swapIndex + 1;
    const [r1, r2] = await Promise.all([
      supabase.from("case_studies").update({ display_order: orderB }).eq("id", itemA.id),
      supabase.from("case_studies").update({ display_order: orderA }).eq("id", itemB.id),
    ]);

    setReordering(false);
    if (r1.error || r2.error) {
      toast({ title: "Reorder failed", variant: "destructive" });
    } else {
      navigate(0);
    }
  }

  const categoryColors: Record<string, string> = {
    "WhatsApp Marketing": "bg-green-100 text-green-700",
    "AI Chatbot": "bg-blue-100 text-blue-700",
    "Omni-Channel": "bg-violet-100 text-violet-700",
  };

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Case Studies</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Manage the case studies shown on your website.</p>
          </div>
          <Button asChild>
            <Link to="/admin/case-studies/new"><Plus className="mr-1.5 h-4 w-4" />New Case Study</Link>
          </Button>
        </div>

        {loading && <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">Failed to load case studies: {error}</div>}

        {!loading && !error && caseStudies.length === 0 && (
          <div className="rounded-xl border border-border/60 bg-white p-12 text-center">
            <p className="mb-4 text-muted-foreground">No case studies yet.</p>
            <Button asChild><Link to="/admin/case-studies/new"><Plus className="mr-1.5 h-4 w-4" />Create your first case study</Link></Button>
          </div>
        )}

        {!loading && !error && caseStudies.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center">Order</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Industry</TableHead>
                  <TableHead className="hidden lg:table-cell">Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseStudies.map((cs, idx) => (
                  <TableRow key={cs.id}>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <button onClick={() => handleReorder(idx, "up")} disabled={idx === 0 || reordering} className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></button>
                        <span className="font-mono text-xs text-muted-foreground">{idx + 1}</span>
                        <button onClick={() => handleReorder(idx, "down")} disabled={idx === caseStudies.length - 1 || reordering} className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></button>
                      </div>
                    </TableCell>
                    <TableCell><p className="text-sm font-semibold text-foreground">{cs.company}</p><p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{cs.tagline}</p></TableCell>
                    <TableCell><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[cs.category] ?? "bg-gray-100 text-gray-600"}`}>{cs.category}</span></TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">{cs.industry}</TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">{cs.publishedDate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild><a href={`/case-studies/${cs.slug}`} target="_blank" rel="noopener noreferrer" aria-label="View live"><ExternalLink className="h-4 w-4" /></a></Button>
                      <Button variant="ghost" size="sm" asChild><Link to={`/admin/case-studies/${cs.id}/edit`} aria-label="Edit"><Pencil className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => { setDeleteSlug(cs.slug); setDeleteId(cs.id); }} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteSlug} onOpenChange={(open) => !open && setDeleteSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete case study?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete <strong>{deleteSlug}</strong>. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">{deleting ? "Deleting…" : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
};

export default AdminDashboard;
