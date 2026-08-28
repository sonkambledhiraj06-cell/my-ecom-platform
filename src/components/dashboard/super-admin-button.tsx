"use client";

import { MouseEvent } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminButton() {
  const router = useRouter();

  const handleSuperAdminClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    router.push("/admin");
  };

  return (
    <button
      type="button"
      onClick={handleSuperAdminClick}
      className="relative z-10 cursor-pointer rounded-lg bg-purple-600 px-4 py-2 font-medium text-white shadow transition-all hover:bg-purple-700"
    >
      Super Admin
    </button>
  );
}
