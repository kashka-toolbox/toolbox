"use client"
import { ConverterBidirectional } from "@/components/ui/tools/converter/converter-bidirectional";

export default function TextToBinary() {
  return <div className="flex flex-col gap-4 lg:gap-8 pt-2">
    <ConverterBidirectional
      a2b={(input: string) => input.split(' ').map(binary => String.fromCodePoint(parseInt(binary, 2))).join('')}
      b2a={(input: string) => Array.from(input).map(char => char.codePointAt(0)?.toString(2).padStart(21, '0')).join(' ')}
      translationKey="tools.encoding.UnicodeBinary">
    </ConverterBidirectional>
  </div>
}