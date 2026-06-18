"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function HomePage() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace('/auth/login')
  }, [router]);
  return null;
}
// trigger deploy baru