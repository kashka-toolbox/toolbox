import { CommandAndNavigationCommand } from "@/components/ui/CommandAndNavigationCommand";
import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { Separator } from "@radix-ui/react-separator";
import { useTranslations } from 'next-intl';

import { ReactNode } from 'react';

function MarqueeItem({ children }: { children: ReactNode }) {
  return (
    <h2
      aria-hidden="true"
      className="text-xl md:text-2xl font-black tracking-normal scroll-m-20 text-nowrap uppercase ml-2 mr-2 transition-colors cursor-default p-2 pl-3 pr-3 rounded-lg border border-primary-foreground hover:border-primary hover:text-primary">
      {children}
    </h2>
  );
}

export default function Home() {
  const t = useTranslations('home');

  return (
    <>
      <div className="container pl-1 pr-1 md:pl-4 md:pr-4 pb-12 min-h-[calc(100vh-256px)]">
        <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
          <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">{t('title')}</h1>
          <span className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
            {t('description')}
          </span>
        </section>
        <section className="mx-auto flex max-w-[600px] min-h-48 flex-col items-center gap-2 py-8 md:my-12 md:mb-8 lg:my-24 lg:mb-20 relative">
          <CommandAndNavigationCommand className="absolute left-0 right-0 h-min" />
        </section>
      </div>

      <Section className="container mb-16" variant={"ghost"}>
        <h1 className="header-section-1">
          <span className="text-primary">100%</span> {t('clientSideComputing.title')}
        </h1>
        <p className="text-base">
          {t('clientSideComputing.description')}
        </p>
      </Section>

      <Section className="container mb-16" variant={"ghost"}>
        <h1 className="header-section-1 flex flex-row items-center gap-4">
          <span><span className="text-primary">{t("openSource.forever")}</span> {t("openSource.title")}</span> <GitHubLogoIcon className="inline-block h-8 w-8" />
        </h1>
        <p className="text-base">
          {t("openSource.description")}
        </p>
        <p className="flex flex-row gap-4">
          <Link
            target="_blank"
            href={"https://github.com/kashka-toolbox/toolbox"}
            className="flex flex-row items-center gap-1 hover:underline text-primary">
            <ArrowRightIcon />
            {t("openSource.GitHub")}</Link>
          <Link
            target="_blank"
            href={"https://github.com/kashka-toolbox/toolbox/blob/development/LICENSE"}
            className="flex flex-row items-center gap-1 hover:underline text-primary">
            <ArrowRightIcon />
            {t("openSource.license")}</Link>
        </p>
      </Section >



    </>
  );
}
