"use client";

import { Input } from "@/components/ui/input";
import { Section } from "@/components/ui/Section";
import { useLocale, useMessages } from "next-intl";
import { useMemo, useState } from "react";

type FlatEntry = { key: string; value: string };

function flatten(node: unknown, prefix = ""): FlatEntry[] {
  const out: FlatEntry[] = [];
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out.push(...flatten(v, prefix ? `${prefix}.${k}` : k));
    }
  } else {
    out.push({ key: prefix, value: String(node ?? "") });
  }
  return out;
}

export default function TranslationsPage() {
  const locale = useLocale();
  const messages = useMessages() as Record<string, unknown>;
  const [query, setQuery] = useState("");

  const entries = useMemo(() => flatten(messages), [messages]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) => e.key.toLowerCase().includes(q) || e.value.toLowerCase().includes(q)
    );
  }, [entries, query]);

  return (
    <Section variant="primary">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h2 className="header-section-2 flex-1">
          All translations — <span className="font-mono">{locale}</span> ({entries.length} keys)
        </h2>
        <Input
          className="max-w-xs"
          placeholder="Filter by key or value…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-3 py-2 font-medium w-[40%]">Key</th>
              <th className="px-3 py-2 font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ key, value }) => (
              <tr key={key} className="border-b last:border-b-0 align-top">
                <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{key}</td>
                <td className="px-3 py-2 whitespace-pre-wrap break-words">
                  {value === "" ? <span className="text-muted-foreground italic">(empty)</span> : value}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="px-3 py-4 text-muted-foreground">
                  No translations match &quot;{query}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
