"use client";
import { useState } from "react";

const plans = [
  {
    provider: "Airalo",
    type: "eSIM",
    data: [
      { gb: 1, days: 7, price: 4.5 },
      { gb: 3, days: 30, price: 11 },
      { gb: 5, days: 30, price: 16 },
    ],
    unlimited: false,
    link: "https://www.airalo.com/",
    notes: "Most popular, T-Mobile & AT&T, data only, 5G speeds"
  },
  {
    provider: "Saily",
    type: "eSIM",
    data: [
      { gb: 1, days: 7, price: 3.99 },
      { gb: 7, days: 7, price: 12.99, unlimited: true },
      { gb: 30, days: 30, price: 47.99, unlimited: true },
    ],
    unlimited: true,
    link: "https://www.saily.com/",
    notes: "Built-in VPN, ad blocker, web protection"
  },
  {
    provider: "Holafly",
    type: "eSIM",
    data: [
      { gb: 5, days: 5, price: 19, unlimited: true },
      { gb: 15, days: 15, price: 47, unlimited: true },
      { gb: 30, days: 30, price: 69, unlimited: true },
    ],
    unlimited: true,
    link: "https://www.holafly.com/",
    notes: "Unlimited 5G, hotspot sharing (1GB/day)"
  },
  {
    provider: "T-Mobile Prepaid eSIM",
    type: "eSIM",
    data: [
      { gb: 999, days: 1, price: 15, unlimited: true },
      { gb: 999, days: 30, price: 40, unlimited: true },
    ],
    unlimited: true,
    link: "https://prepaid.t-mobile.com/esim-app",
    notes: "Full US number, calls/texts included"
  },
];

type PlanMatch = {
  provider: string;
  type: string;
  link: string;
  notes: string;
  match: {
    gb: number;
    days: number;
    price: number;
    unlimited?: boolean;
  };
};

function getBestPlans(days: number, gb: number): PlanMatch[] {
  // Find plans that match or exceed both days and GB
  const result: PlanMatch[] = [];
  for (const plan of plans) {
    const match = plan.data.find(
      (d) => d.days >= days && (d.unlimited || d.gb >= gb)
    );
    if (match) {
      result.push({
        provider: plan.provider,
        type: plan.type,
        link: plan.link,
        notes: plan.notes,
        match,
      });
    }
  }
  return result;
}

export default function MobileComparison() {
  const [days, setDays] = useState(7);
  const [gb, setGb] = useState(3);
  const bestPlans = getBestPlans(days, gb);

  return (
    <section className="bg-card rounded-lg p-6 mb-6 shadow border border-border">
      <h2 className="text-2xl font-semibold mb-4 text-card-foreground">Compare Mobile Plans</h2>
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1">
          <label htmlFor="days" className="block text-sm font-medium mb-1">Trip Length (days)</label>
          <input
            id="days"
            type="range"
            min={1}
            max={30}
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm mt-1">{days} days</div>
        </div>
        <div className="flex-1">
          <label htmlFor="gb" className="block text-sm font-medium mb-1">Data Needed (GB)</label>
          <input
            id="gb"
            type="range"
            min={1}
            max={50}
            value={gb}
            onChange={e => setGb(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm mt-1">{gb} GB</div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-border text-sm">
          <thead>
            <tr className="bg-primary/10">
              <th className="p-2 text-left text-foreground">Provider</th>
              <th className="p-2 text-left text-foreground">Type</th>
              <th className="p-2 text-left text-foreground">Plan</th>
              <th className="p-2 text-left text-foreground">Price (USD)</th>
              <th className="p-2 text-left text-foreground">Notes</th>
            </tr>
          </thead>
          <tbody>
            {bestPlans.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No matching plans found.</td></tr>
            ) : (
              bestPlans.map((plan) => (
                <tr key={plan.provider} className="border-b border-border">
                  <td className="p-2 font-semibold">
                    <a href={plan.link} target="_blank" rel="noopener" className="underline text-primary hover:text-primary/80">{plan.provider}</a>
                  </td>
                  <td className="p-2">{plan.type}</td>
                  <td className="p-2">
                    {plan.match.unlimited ? 'Unlimited' : `${plan.match.gb}GB / ${plan.match.days} days`}
                  </td>
                  <td className="p-2">${plan.match.price}</td>
                  <td className="p-2">{plan.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
