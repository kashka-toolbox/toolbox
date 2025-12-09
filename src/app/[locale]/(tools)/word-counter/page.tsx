"use client"

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { Metric } from "./Metric";
import { Section } from "@/components/ui/Section";

const metrics = [
  { label: "characters", regex: /./g },
  { label: "words", regex: /\b\w+\b/g },
  { label: "sentences", regex: /[.!?](?:$|\s)+/g },
];

export default function Home() {
  const [text, setText] = useState("");

  return (
    <Section className="flex flex-col gap-4">
      <span className="flex flex-col gap-1">
        <Label htmlFor="wordcounter" className="font-semibold tracking-tight text-2xl">Enter your Text here:</Label>
        <Textarea
          id="wordcounter"
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="min-h-32 hmd:min-h-64" />
      </span>
      <span className="flex flex-row justify-between min-h-16">
        {metrics.map((metric, index) => (
          [
            <Metric key={metric.label} label={metric.label} value={text.match(metric.regex)?.length ?? 0} />,
            (index != metrics.length - 1) ? <Separator key={metric.label + "_seperator"} orientation="vertical" /> : null
          ]
        ))}
      </span>
    </Section>
  );
}

