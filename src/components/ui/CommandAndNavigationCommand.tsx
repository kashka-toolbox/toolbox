"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "@/i18n/navigation";
import { menuData } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";


export const CommandAndNavigationCommand = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const router = useRouter()
  const t = useTranslations("navigation");

  const [showCommandList, setShowCommandList] = useState(false);
  const commandListRef = useRef(null);

  return (
    <Command
      ref={ref}
      className={cn("rounded-lg border shadow-md", className, showCommandList ? "shadow-2xl" : "")}
      onFocus={() => setShowCommandList(true)}
      onBlur={() => setShowCommandList(false)}>
      <CommandInput
        placeholder={t("searchbar.placeholder")} />
      <CSSTransition
        nodeRef={commandListRef}
        in={showCommandList}
        timeout={200}
        classNames={{
          enter: "max-h-[300px]",
          enterActive: "max-h-[300px]",
          enterDone: "max-h-[300px]",
        }}>
        <CommandList className={cn("transition-[max-height,border-top-width] duration-200", showCommandList ? "border-t" : "border-t-0")} ref={commandListRef}>
          <CommandEmpty>{t("searchbar.noResultsFound")}</CommandEmpty>
          {
            menuData.map((category, index) => {
              if (category.displayInMenu !== true)
                return undefined;

              return (
                <CommandGroup key={index} heading={t(category.translationKey + "." + "title")}>
                  {category.items.map((subItem, subIndex) => (
                    <CommandItem
                      onSelect={() => {
                        if (subItem.href && subItem.openInNewTab != true)
                          router.push(subItem.href);
                        else if (subItem.href && subItem.openInNewTab === true)
                          window.open(subItem.href, '_blank');
                      }}
                      key={subIndex}
                      className="hover:cursor-pointer flex flex-row items-baseline overflow-hidden text-nowrap group/cmd"
                      keywords={["test"]}
                    >
                      {subItem.icon ? <subItem.icon className="mr-2 h-4 w-4 min-w-4 place-self-center" /> : <div className="mr-2 h-4 w-4 min-w-4" />}
                      <span className="text-nowrap inline-block">{t(category.translationKey + "." + subItem.translationKey + "." + "title")}</span>
                      <span className="text-muted-foreground pl-2 text-xs text-ellipsis overflow-hidden min-w-0 transition-opacity duration-100 opacity-0 group-data-[selected='true']/cmd:opacity-100">{t(category.translationKey + "." + subItem.translationKey + "." + "description")}</span>
                      <CommandShortcut className="w-fit pl-2">{subItem.shortcut}</CommandShortcut>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })
          }
        </CommandList>
      </CSSTransition>
    </Command>
  );
});
CommandAndNavigationCommand.displayName = "CommandAndNavigationCommand";
