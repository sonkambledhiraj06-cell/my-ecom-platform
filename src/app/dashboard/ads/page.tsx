"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Megaphone,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  Zap,
} from "lucide-react";

export default function AdsPage() {
  const [campaigns, setCampaigns] = useState([
    {
      id: "CAMP-01",
      name: "Meta - Leather Notebook conversions",
      platform: "Meta",
      spend: 12400,
      cpp: 87.9,
      targetCpp: 100,
      status: "active",
      rule: "Auto-pause if CPP > ₹100",
    },
    {
      id: "CAMP-02",
      name: "Google - Desk Organizer Search",
      platform: "Google",
      spend: 8100,
      cpp: 130.6,
      targetCpp: 110,
      status: "paused",
      rule: "Auto-paused (CPP Exceeded)",
    },
    {
      id: "CAMP-03",
      name: "Meta - Wooden Pen Stand Retargeting",
      platform: "Meta",
      spend: 5200,
      cpp: 76.4,
      targetCpp: 90,
      status: "active",
      rule: "Auto-pause if CPP > ₹90",
    },
  ]);

  const toggleStatus = (id: string) => {
    setCampaigns((previousCampaigns) =>
      previousCampaigns.map((campaign) =>
        campaign.id === id
          ? {
              ...campaign,
              status: campaign.status === "active" ? "paused" : "active",
            }
          : campaign,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ads Automation &amp; Rule Engine</h2>
          <p className="mt-1 text-xs text-gray-500">
            Monitor Meta &amp; Google campaigns with automatic budget protection and kill-switch rules.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Zap size={18} /> Create Auto-Pause Rule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Active Campaigns"
          value="2 Live"
          icon={<Megaphone size={22} />}
          iconClassName="bg-purple-50 text-purple-600"
        />
        <SummaryCard
          label="Combined Ad Spend"
          value="₹25,700"
          icon={<DollarSign size={22} />}
          iconClassName="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          label="Budget Wasted Saved"
          value="₹4,200"
          valueClassName="text-emerald-600"
          icon={<ShieldAlert size={22} />}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b p-4">
          <h3 className="text-sm font-bold text-gray-800">Connected Ad Accounts &amp; Guardrails</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3.5">Campaign Name</th>
                <th className="px-5 py-3.5">Platform</th>
                <th className="px-5 py-3.5">Spend</th>
                <th className="px-5 py-3.5">Current CPP</th>
                <th className="px-5 py-3.5">Target CPP Limit</th>
                <th className="px-5 py-3.5">Automation Rule</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaigns.map((campaign) => {
                const isOverBudget = campaign.cpp > campaign.targetCpp;
                const isActive = campaign.status === "active";

                return (
                  <tr key={campaign.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold text-gray-900">{campaign.name}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded px-2.5 py-1 text-xs font-medium ${campaign.platform === "Meta" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}
                      >
                        {campaign.platform}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium">₹{campaign.spend}</td>
                    <td className="px-5 py-4">
                      <span className={`font-bold ${isOverBudget ? "text-red-600" : "text-emerald-600"}`}>
                        ₹{campaign.cpp}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">₹{campaign.targetCpp}</td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{campaign.rule}</td>
                    <td className="px-5 py-4">
                      <StatusBadge active={isActive} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(campaign.id)}
                        className="flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:text-black"
                      >
                        {isActive ? (
                          <><PauseCircle size={14} className="text-red-500" /> Pause</>
                        ) : (
                          <><PlayCircle size={14} className="text-emerald-500" /> Enable</>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueClassName = "text-gray-900",
  icon,
  iconClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <article className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className={`rounded-lg p-3 ${iconClassName}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
        <h4 className={`text-xl font-bold ${valueClassName}`}>{value}</h4>
      </div>
    </article>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}
    >
      <span className={`size-2 rounded-full ${active ? "animate-pulse bg-emerald-500" : "bg-gray-400"}`} />
      {active ? "Active" : "Paused"}
    </span>
  );
}
