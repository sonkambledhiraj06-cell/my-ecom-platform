"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import BrandSettingsSection from "@/components/dashboard/brand-settings-section";

export default function SettingsPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRole = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) {
        setUserRole(null);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      if (profileError) throw profileError;
      setUserRole(profile?.role ?? "user");
    } catch (caughtError) {
      console.error("Unable to load user role:", caughtError);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadRole);
  }, [loadRole]);

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading settings...</div>;
  return <div className="mx-auto max-w-5xl"><BrandSettingsSection userRole={userRole ?? "user"} /></div>;
}
