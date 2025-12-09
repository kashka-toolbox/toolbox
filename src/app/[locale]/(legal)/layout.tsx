"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getTranslationKeyByHref } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()
  const pageTitle = getTranslationKeyByHref(pathname);
  const t_nav = useTranslations("navigation");

  return (
    <main className="container pb-2 pt-2 md:pt-8 md:pb-8 min-h-screen mx-auto max-w-screen-2xl p-8 pt-6">
      <section className="pb-2">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>{t_nav("legal." + pageTitle + ".title")}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      </section>
      {children}
    </main>
  );
}
