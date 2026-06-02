import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import AdminShell from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

interface FormValues {
  name: string;
  monthly_price: number;
  yearly_price: number;
  description: string;
  features: string;
  popular: boolean;
  display_order: number;
}

function linesToFeatures(value: string): string[] {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

const AdminPricingForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingData, setLoadingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: "",
      monthly_price: 0,
      yearly_price: 0,
      description: "",
      features: "",
      popular: false,
      display_order: 99,
    },
  });

  useEffect(() => {
    if (!isEdit) return;
    supabase.from("pricing_plans").select("*").eq("id", Number(id)).maybeSingle().then(({ data, error }) => {
      if (error || !data) {
        toast({ title: "Pricing plan not found", variant: "destructive" });
        navigate("/admin/pricing");
        return;
      }
      reset({
        name: data.name,
        monthly_price: data.monthly_price,
        yearly_price: data.yearly_price,
        description: data.description,
        features: (data.features ?? []).join("\n"),
        popular: data.popular,
        display_order: data.display_order ?? 99,
      });
      setLoadingData(false);
    });
  }, [id, isEdit, navigate, reset, toast]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    const payload = {
      name: values.name.trim(),
      monthly_price: Number(values.monthly_price),
      yearly_price: Number(values.yearly_price),
      description: values.description.trim(),
      features: linesToFeatures(values.features),
      popular: Boolean(values.popular),
      display_order: Number(values.display_order),
    };

    const { error } = isEdit
      ? await supabase.from("pricing_plans").update(payload).eq("id", Number(id))
      : await supabase.from("pricing_plans").insert(payload);

    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: isEdit ? "Pricing plan updated" : "Pricing plan created" });
      navigate("/admin/pricing");
    }
  }

  if (loadingData) {
    return <AdminShell><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" /></AdminShell>;
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/admin/pricing"><ArrowLeft className="mr-1.5 h-4 w-4" />All Pricing Plans</Link>
        </Button>
        <h1 className="mb-6 text-2xl font-bold text-foreground">{isEdit ? "Edit Pricing Plan" : "New Pricing Plan"}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-xl border border-border/60 bg-white p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Plan name *</Label>
              <Input id="name" {...register("name", { required: "Plan name is required" })} />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="display_order">Display order</Label>
              <Input id="display_order" type="number" {...register("display_order", { valueAsNumber: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="monthly_price">Monthly price *</Label>
              <Input id="monthly_price" type="number" {...register("monthly_price", { valueAsNumber: true, required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yearly_price">Yearly price *</Label>
              <Input id="yearly_price" type="number" {...register("yearly_price", { valueAsNumber: true, required: true })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" rows={3} {...register("description", { required: "Description is required" })} />
            {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="features">Features *</Label>
            <Textarea id="features" rows={7} placeholder="One feature per line" {...register("features", { required: "At least one feature is required" })} />
            {errors.features && <p className="text-xs text-red-600">{errors.features.message}</p>}
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-border/60 p-3 text-sm font-medium">
            <Checkbox checked={watch("popular")} onCheckedChange={(checked) => setValue("popular", checked === true)} />
            Mark as Most Popular
          </label>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild><Link to="/admin/pricing">Cancel</Link></Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Plan"}</Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
};

export default AdminPricingForm;
