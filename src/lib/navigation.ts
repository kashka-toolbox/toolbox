import { BlendingModeIcon, ExclamationTriangleIcon, FileTextIcon, GitHubLogoIcon, HomeIcon, TextIcon, UpdateIcon } from "@radix-ui/react-icons";

interface NavigationGroupTranslationKey {
  translationKey: string;
}

/**
 * Relative to the NavigationGroupTranslationKey
 */
type NavigationItemTranslationKey = {
  translationKey: string
};

interface DisplayInMenuField {
  displayInMenu: boolean;
}

interface Navigable {
  href: string;
}

interface Icon {
  icon: React.ElementType;
}

interface CommandShortcut {
  shortcut: string;
}

interface OpenInNewTab {
  openInNewTab: boolean;
}


export const menuData: Array<NavigationGroupTranslationKey & DisplayInMenuField & {
  items: Array<
    DisplayInMenuField
    & NavigationItemTranslationKey
    & Partial<Navigable>
    & Partial<Icon>
    & Partial<CommandShortcut>
    & Partial<OpenInNewTab>>;
}> = [
    {
      translationKey: "gettingStarted",
      displayInMenu: true,
      items: [
        {
          translationKey: "home",
          href: "/",
          displayInMenu: false,
          shortcut: "*",
          icon: HomeIcon,
        },
        {
          translationKey: "source",
          href: "https://github.com/Morten-Renner/mortens-toolbox",
          displayInMenu: false,
          icon: GitHubLogoIcon,
          openInNewTab: true,
        },
      ],
    },
    {
      translationKey: "legal",
      displayInMenu: false,
      items: [
        {
          translationKey: "privacy",
          href: "/privacy",
          displayInMenu: false,
        },
        {
          translationKey: "imprint",
          href: "/imprint",
          displayInMenu: false,
        }
      ]
    },
    {
      translationKey: "debug",
      displayInMenu: process.env.NEXT_PUBLIC_DISPLAY_DEBUG === "true",
      items: [
        {
          translationKey: "debug",
          href: "/debug",
          displayInMenu: false,
          icon: ExclamationTriangleIcon,
        },
        {
          translationKey: "auth",
          href: "/debug/auth",
          displayInMenu: process.env.NEXT_PUBLIC_DISPLAY_DEBUG === "true",
          icon: ExclamationTriangleIcon,
        },
        {
          translationKey: "ui",
          href: "/debug/ui",
          displayInMenu: process.env.NEXT_PUBLIC_DISPLAY_DEBUG === "true",
          icon: ExclamationTriangleIcon,
        }
      ],
    },
    {
      translationKey: "tools.text",
      displayInMenu: true,
      items: [
        {
          translationKey: "wordCounter",
          href: "/word-counter",
          displayInMenu: true,
          icon: TextIcon,
        },
      ],
    },
    {
      translationKey: "tools.encoding",
      displayInMenu: true,
      items: [
        {
          translationKey: "URL",
          href: "/encoding/url",
          displayInMenu: true,
          icon: UpdateIcon,
        },
        {
          translationKey: "base64",
          href: "/encoding/base64",
          displayInMenu: true,
          icon: UpdateIcon,
        },
        {
          translationKey: "UnicodeBinary",
          href: "/encoding/UnicodeBinary",
          displayInMenu: true,
          icon: UpdateIcon,
        }
      ],
    },
    {
        translationKey: "tools.conversion",
      displayInMenu: true,
      items: [
        {
          translationKey: "CelciusToFahrenheit",
          href: "/conversion/celcius-to-fahrenheit",
          displayInMenu: true,
          icon: UpdateIcon,
        }
      ]
    },
    {
      translationKey: "tools.color",
      displayInMenu: true,
      items: [
        {
          translationKey: "hexToHSL",
          href: "/color/hex-to-hsl",
          displayInMenu: true,
          icon: BlendingModeIcon,
        },
      ],
    },
    {
      translationKey: "tools.pdf",
      displayInMenu: true,
      items: [
        {
          translationKey: "split",
          href: "/pdf/split",
          displayInMenu: true,
          icon: FileTextIcon,
        },
      ],
    }
  ];

export function getTranslationKeyByHref(href: string): string | undefined {
  href = trimLocale(href);

  return menuData
    .flatMap(category => category.items)
    .find(item => item.href === href)?.translationKey;
}

export function getGroupTranslationKeyByHref(href: string): string | undefined {
  href = trimLocale(href);

  return menuData.find((p) => {
    return p.items.findIndex(item => item.href === href) != -1
  })?.translationKey;
}

export function trimLocale(href: string): string {
  //example: /de/tools/word-counter -->  /tools/word-counter
  return href.replace(/\/[a-z]{2}/, '');
}