"use client";

import { useEffect } from "react";



export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="">
      {children}
    </section>
  );
}
