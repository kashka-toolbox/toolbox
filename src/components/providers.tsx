"use client";

import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "./auth-provider";

export default function Providers({ children }: {
  readonly children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}