export interface PricingPlan {
  id: number;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  popular: boolean;
  displayOrder: number;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 1,
    name: "Basic",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for freelancers and startups.",
    features: ["50 invoices/month", "10 customers", "100 transactions/month", "Basic analytics", "Email support"],
    popular: false,
    displayOrder: 1,
  },
  {
    id: 2,
    name: "Professional",
    monthlyPrice: 500,
    yearlyPrice: 5000,
    description: "Best for growing businesses.",
    features: ["2000 invoices/month", "500 customers", "Advanced analytics", "Priority support", "Team access"],
    popular: true,
    displayOrder: 2,
  },
  {
    id: 3,
    name: "Enterprise",
    monthlyPrice: 2000,
    yearlyPrice: 20000,
    description: "Unlimited access for large teams.",
    features: ["Unlimited invoices", "Unlimited customers", "API access", "Dedicated support", "Custom integrations"],
    popular: false,
    displayOrder: 3,
  },
];
