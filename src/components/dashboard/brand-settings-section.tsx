"use client";

import { useEffect, useState } from "react";
import { BrandConfig, defaultBrandConfig } from "@/lib/brand-config";

interface BrandSettingsSectionProps {
  userRole: string;
}

const storageKey = "custom_brand_config";

export default function BrandSettingsSection({ userRole }: BrandSettingsSectionProps) {
  const [brand, setBrand] = useState<BrandConfig>(defaultBrandConfig);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const storedBrand = localStorage.getItem(storageKey);
        if (storedBrand) {
          setBrand({ ...defaultBrandConfig, ...JSON.parse(storedBrand) });
        }
      } catch {
        setSaveError("Unable to load saved branding settings.");
      }
    });
  }, []);

  if (userRole !== "super_admin" && userRole !== "admin") {
    return <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">Access Denied: White-label customization is restricted to Admins and Super Admins only.</div>;
  }

  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(brand));
      setSaveError(null);
      setIsSaved(true);
      window.setTimeout(() => setIsSaved(false), 3000);
    } catch {
      setSaveError("Unable to save branding settings.");
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b pb-4"><div><h1 className="text-xl font-bold text-gray-800">White-Label Branding Settings</h1><p className="mt-1 text-xs text-gray-500">Customize the application name, logo, and theme colors.</p></div><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">Admin Feature</span></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Application Name"><input type="text" value={brand.appName} onChange={(event) => setBrand({ ...brand, appName: event.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" /></Field>
        <Field label="Tagline"><input type="text" value={brand.tagline} onChange={(event) => setBrand({ ...brand, tagline: event.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" /></Field>
        <Field label="Logo URL"><input type="text" value={brand.logoUrl} onChange={(event) => setBrand({ ...brand, logoUrl: event.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" /></Field>
        <Field label="Footer Text"><input type="text" value={brand.footerText} onChange={(event) => setBrand({ ...brand, footerText: event.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" /></Field>
        <ColorField label="Primary Color" value={brand.theme.primaryColor} onChange={(value) => setBrand({ ...brand, theme: { ...brand.theme, primaryColor: value } })} />
        <ColorField label="Secondary Color" value={brand.theme.secondaryColor} onChange={(value) => setBrand({ ...brand, theme: { ...brand.theme, secondaryColor: value } })} />
        <ColorField label="Accent Color" value={brand.theme.accentColor} onChange={(value) => setBrand({ ...brand, theme: { ...brand.theme, accentColor: value } })} />
      </div>
      <div className="flex items-center gap-4 border-t pt-4"><button type="button" onClick={handleSave} className="relative z-10 cursor-pointer rounded-xl bg-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700">Save Branding Changes</button>{isSaved && <span className="text-xs font-semibold text-green-600">Branding settings updated.</span>}{saveError && <span className="text-xs font-semibold text-red-600">{saveError}</span>}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-xs font-bold uppercase text-gray-700">{label}<span className="mt-1 block">{children}</span></label>; }
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <Field label={label}><div className="flex items-center gap-2"><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 cursor-pointer rounded border" /><input type="text" value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-purple-500" /></div></Field>; }
