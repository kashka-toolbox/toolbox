"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getTranslationKeyByHref } from "@/lib/navigation";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()
  const pageTitle = getTranslationKeyByHref(pathname);

  return (
    <main className="container pb-2 pt-2 md:pt-8 md:pb-8 min-h-screen mx-auto max-w-screen-2xl p-8 pt-6">
      <section className="pb-4">
        <Alert variant={"destructive"}>
            <ExclamationTriangleIcon />
            <AlertTitle>Debug</AlertTitle>
            <AlertDescription>
              <p className="mb-2">This page is for internal debugging purposes.</p>
              <Link href="/"><Button>Go Home</Button></Link>
            </AlertDescription>
        </Alert>
      </section>
      <section className="pb-2">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbLink href="/debug">Debug</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      </section>
      {children}
    </main>
  );
}
