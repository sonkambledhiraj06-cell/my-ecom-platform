"use client";

import { useState } from "react";
import { IndianRupee, User, Phone, Mail, MapPin } from "lucide-react";

export interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface CheckoutFormProps {
  totalAmount: number;
  onSubmit: (data: CheckoutFormData) => void;
  isProcessing: boolean;
}

export function CheckoutForm({ totalAmount, onSubmit, isProcessing }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const validate = () => {
    if (!formData.name.trim()) return "Please enter your name";
    if (!formData.phone.trim() || formData.phone.length < 10) return "Please enter a valid phone number";
    if (!formData.email.trim() || !formData.email.includes("@")) return "Please enter a valid email address";
    if (!formData.address.trim()) return "Please enter your shipping address";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);
    if (isProcessing) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InputField
          label="Full Name"
          value={formData.name}
          onChange={(v) => setFormData({ ...formData, name: v })}
          icon={<User size={18} />}
          required
        />
        <InputField
          label="Phone Number"
          value={formData.phone}
          onChange={(v) => setFormData({ ...formData, phone: v })}
          icon={<Phone size={18} />}
          type="tel"
          required
        />
      </div>

      <InputField
        label="Email Address"
        value={formData.email}
        onChange={(v) => setFormData({ ...formData, email: v })}
        icon={<Mail size={18} />}
        type="email"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Shipping Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500"
          placeholder="Enter your full shipping address"
        />
      </div>

      <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
        <span className="text-sm font-medium text-gray-700">Order Total</span>
        <span className="flex items-center text-2xl font-bold text-gray-900">
          <IndianRupee size={20} />
          {totalAmount.toLocaleString("en-IN")}
        </span>
      </div>

      <button
        type="submit"
        disabled={isProcessing}
        className="w-full rounded-lg bg-purple-600 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? "Processing Payment..." : "Pay with Razorpay"}
      </button>
    </form>
  );
}

function InputField({
  label,
  value,
  onChange,
  icon,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-purple-500"
        />
      </div>
    </div>
  );
}
