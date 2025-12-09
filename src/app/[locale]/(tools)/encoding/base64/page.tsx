"use client"
import { ConverterBidirectional } from "@/components/ui/tools/converter/converter-bidirectional";


export default function Base64Encoding() {
  return <div className="flex flex-col gap-4 lg:gap-8 pt-2">
    <ConverterBidirectional
      a2b={(input: string) => btoa(unescape(encodeURIComponent(input)))}
      b2a={(input: string) => decodeURIComponent(escape(atob(input)))}
      translationKey="tools.encoding.base64">
    </ConverterBidirectional>
  </div>
}