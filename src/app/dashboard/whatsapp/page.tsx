"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import {
  Bot,
  CheckCheck,
  MessageSquare,
  PhoneCall,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ChatMessage {
  id: string;
  order_id: string;
  customer_phone: string;
  message: string;
  channel: string;
  status: string;
  sent_at: string;
}

interface Chat {
  id: string;
  order_id: string;
  customer_phone: string;
  message: string;
  status: string;
  sent_at: string;
}

export default function WhatsAppPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("notifications")
          .select("*")
          .order("sent_at", { ascending: false })
          .limit(50);

        if (fetchError) throw fetchError;

        const notifications = (data ?? []) as ChatMessage[];
        const grouped = notifications.reduce<Chat[]>((acc, notification) => {
          const existing = acc.find((c) => c.customer_phone === notification.customer_phone);
          if (existing) {
            return acc;
          }
          const latest = notifications.find(
            (n) => n.customer_phone === notification.customer_phone,
          );
          if (latest) {
            acc.push({
              id: latest.id,
              order_id: latest.order_id,
              customer_phone: latest.customer_phone,
              message: latest.message,
              status: latest.status,
              sent_at: latest.sent_at,
            });
          }
          return acc;
        }, []);

        setChats(grouped);
        if (grouped.length > 0 && !activeChat) {
          setActiveChat(grouped[0]);
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load notifications");
      } finally {
        setLoading(false);
      }
    };

    void fetchNotifications();
  }, []);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            WhatsApp CRM &amp; Automated Messaging
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Manage customer conversations, send order updates, and trigger automated WhatsApp notifications.
          </p>
        </div>
        <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" /> Official API Connected
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid h-[580px] grid-cols-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm md:grid-cols-3">
        <div className="flex h-full flex-col border-r bg-gray-50/50">
          <div className="border-b bg-white p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <MessageSquare size={16} className="text-emerald-600" /> Live Conversations
            </h3>
          </div>
          <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No conversations yet.</div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setActiveChat(chat)}
                  className={`flex w-full cursor-pointer flex-col gap-1 p-4 text-left transition hover:bg-white ${
                    activeChat?.id === chat.id ? "border-l-4 border-emerald-500 bg-white shadow-sm" : ""
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{chat.customer_phone}</span>
                    <span className="text-[11px] text-gray-400">{formatTime(chat.sent_at)}</span>
                  </span>
                  <span className="line-clamp-1 text-xs text-gray-600">{chat.message}</span>
                  <span className="mt-1 flex items-center justify-between">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">{chat.order_id}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      chat.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {chat.status}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex h-full flex-col bg-white md:col-span-2">
          {activeChat ? (
            <>
              <div className="flex items-center justify-between border-b bg-gray-50/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                    {activeChat.customer_phone.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{activeChat.customer_phone}</h4>
                    <p className="text-xs text-gray-500">Order: {activeChat.order_id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Call customer"
                  className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50"
                >
                  <PhoneCall size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4">
                <div className="my-2 flex flex-col items-center">
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-600">
                    {new Date(activeChat.sent_at).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-xs space-y-1 rounded-2xl rounded-tl-none border bg-white p-3 text-xs text-gray-800 shadow-sm md:max-w-md">
                    <p>{activeChat.message}</p>
                    <span className="block text-right text-[10px] text-gray-400">{formatTime(activeChat.sent_at)}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-xs space-y-1 rounded-2xl rounded-tr-none bg-emerald-600 p-3 text-xs text-white shadow-sm md:max-w-md">
                    <div className="mb-1 flex items-center gap-1 border-b border-emerald-500 pb-1 text-[10px] font-semibold opacity-90">
                      <Bot size={12} /> Auto Template Triggered: Order Status
                    </div>
                    <p>Hello, your order {activeChat.order_id} is currently being packed and will be dispatched soon.</p>
                    <span className="flex items-center justify-end gap-1 text-[10px] opacity-75">
                      {formatTime(activeChat.sent_at)} <CheckCheck size={12} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t bg-white p-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button type="button" className="whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                    Send Tracking Link
                  </button>
                  <button type="button" className="whitespace-nowrap rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
                    Request COD Confirmation
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    aria-label="Custom message"
                    placeholder="Type custom message or reply..."
                    className="flex-1 rounded-lg border px-4 py-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                  <button type="button" aria-label="Send message" className="rounded-lg bg-emerald-600 p-2.5 text-white transition hover:bg-emerald-700">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Select a conversation to view details
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
