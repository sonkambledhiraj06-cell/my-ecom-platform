"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  full_name: string | null;
  role: string | null;
  is_banned?: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
}

export default function AdvancedAdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const [{ data: profilesData, error: profilesError }, { count, error: productsError }] =
        await Promise.all([
          supabase.from("profiles").select("id, full_name, role, is_banned"),
          supabase.from("products").select("*", { count: "exact", head: true }),
        ]);

      if (profilesError || productsError) {
        throw new Error(profilesError?.message ?? productsError?.message ?? "Unable to load admin data");
      }
      setUsers((profilesData ?? []) as UserProfile[]);
      setProductCount(count ?? 0);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(fetchDashboardData);
  }, [fetchDashboardData]);

  const addLog = (action: string) => {
    setLogs((previousLogs) => [
      { id: crypto.randomUUID(), action, timestamp: new Date().toLocaleTimeString() },
      ...previousLogs.slice(0, 9),
    ]);
  };

  const updateUserRole = async (user: UserProfile, newRole: string) => {
    setUpdatingUserId(user.id);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", user.id);
      if (updateError) throw updateError;
      addLog(`Changed user ${user.id.slice(0, 8)}... role to ${newRole}`);
      await fetchDashboardData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error updating role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const addRole = async (user: UserProfile) => {
    await updateUserRole(user, "super_admin");
  };

  const deleteRole = async (user: UserProfile) => {
    if (user.role === "user") return;
    if (!window.confirm(`Remove the role from ${user.full_name || "this user"}?`)) return;
    await updateUserRole(user, "user");
  };

  const toggleBan = async (user: UserProfile) => {
    setUpdatingUserId(user.id);
    const nextBanState = !user.is_banned;
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_banned: nextBanState })
        .eq("id", user.id);
      if (updateError) throw updateError;
      addLog(`${nextBanState ? "Banned" : "Unbanned"} user ${user.id.slice(0, 8)}...`);
      await fetchDashboardData();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Error changing ban status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const query = searchQuery.toLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !query ||
      user.id.toLowerCase().includes(query) ||
      user.full_name?.toLowerCase().includes(query);
    return Boolean(matchesSearch && (roleFilter === "all" || user.role === roleFilter));
  });
  const superAdminCount = users.filter((user) => user.role === "super_admin").length;
  const bannedCount = users.filter((user) => user.is_banned).length;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link
              href="/dashboard"
              className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-all hover:text-purple-600"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Control Center</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage roles, view system metrics, and control security operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              <span className="size-2 animate-pulse rounded-full bg-green-500" />
              System Operational
            </span>
            <button
              type="button"
              onClick={() => void fetchDashboardData()}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-100"
            >
              Refresh Data
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={users.length} />
          <StatCard label="Super Admins" value={superAdminCount} valueClassName="text-purple-600" />
          <StatCard label="Total Products" value={productCount} valueClassName="text-blue-600" />
          <StatCard label="Active Suspensions" value={bannedCount} valueClassName="text-red-500" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
              <h2 className="text-lg font-bold text-gray-800">User Management</h2>
              <div className="flex items-center gap-3">
                <input
                  type="search"
                  placeholder="Search user ID or name..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading user database...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-600">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="p-4">User Details</th>
                      <th className="p-4">Role</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-400">
                          No matching users found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSuperAdmin = user.role === "super_admin";
                        const isUpdating = updatingUserId === user.id;
                        return (
                          <tr key={user.id} className="transition hover:bg-gray-50/80">
                            <td className="p-4">
                              <p className="font-semibold text-gray-800">
                                {user.full_name || "Anonymous User"}
                              </p>
                              <p className="font-mono text-xs text-gray-400">{user.id}</p>
                            </td>
                            <td className="p-4">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isSuperAdmin ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                                {user.role || "user"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`rounded px-2 py-0.5 text-xs font-bold ${user.is_banned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                {user.is_banned ? "Banned" : "Active"}
                              </span>
                            </td>
                            <td className="space-x-2 p-4 text-right">
                              <button type="button" disabled={isUpdating || isSuperAdmin} onClick={() => void addRole(user)} className="rounded-lg bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50">
                                Add Role
                              </button>
                              <button type="button" disabled={isUpdating || !isSuperAdmin} onClick={() => void deleteRole(user)} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50">
                                Delete Role
                              </button>
                              <button type="button" disabled={isUpdating} onClick={() => void toggleBan(user)} className={`rounded-lg px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${user.is_banned ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
                                {user.is_banned ? "Unban" : "Ban"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="mb-4 text-lg font-bold text-gray-800">Audit Activity Logs</h2>
              {logs.length === 0 ? (
                <p className="text-sm italic text-gray-400">No actions recorded in this session yet.</p>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs">
                      <span className="block font-semibold text-gray-700">{log.action}</span>
                      <span className="mt-1 block font-mono text-gray-400">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 border-t pt-4 text-xs text-gray-400">Session audit logging active.</div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, valueClassName = "text-gray-800" }: { label: string; value: number; valueClassName?: string }) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
      <h2 className={`mt-2 text-3xl font-extrabold ${valueClassName}`}>{value}</h2>
    </article>
  );
}
