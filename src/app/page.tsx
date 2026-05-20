"use client";

import { useEffect } from "react";

export default function RootPage() {
  useEffect(() => {
    const lang = navigator.language.toLowerCase();
    const target = lang.startsWith("ko") ? "/ko" : "/en";
    window.location.replace(target);
  }, []);

  return null;
}
