import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { usePricingPlans } from "@/hooks/usePricingPlans";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

const AdminPricing = () => {
  const { data: plans, loading, error } = usePricingPlans();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const deleteName = plans.find((plan) => plan.id === deleteId)?.name;

  async function handleDelete() {
    if (!deleteId) return;
    const { error: deleteError } = await supabase.from("pricing_plans").delete().eq("id", deleteId);
    setDeleteId(null);
    if (deleteError) {
      toast({ title: "Delete failed", description: deleteError.message, variant: "destructive" });
    } else {
      toast({ title: "Pricing plan deleted" });
      navigate(0);
    }
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pricing</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Manage the pricing plans shown on your website.</p>
          </div>
          <Button asChild>
            <Link to="/admin/pricing/new"><Plus className="mr-1.5 h-4 w-4" />New Plan</Link>
          </Button>
        </div>

        {loading && <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">Failed to load pricing plans: {error}</div>}
        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Yearly</TableHead>
                  <TableHead>Popular</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </TableCell>
                    <TableCell>₹{plan.monthlyPrice}</TableCell>
                    <TableCell>₹{plan.yearlyPrice}</TableCell>
                    <TableCell>{plan.popular ? <Badge>Most Popular</Badge> : <span className="text-muted-foreground">No</span>}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild><Link to={`/admin/pricing/${plan.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteId(plan.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete pricing plan?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete <strong>{deleteName}</strong>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
};

export default AdminPricing;
