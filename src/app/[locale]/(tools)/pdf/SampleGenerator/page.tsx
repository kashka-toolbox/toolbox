"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/ui/Section";
import { saveBlobToFileWithDialog } from "@/lib/files/saveBlobToFileWithDialog";
import { useTranslations } from "next-intl";
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useState } from "react";

const generateText = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default function PDFSampleGenerator() {
  const t = useTranslations("pdfSampleGenerator"); //TODO adjust translation key
  const [pageCount, setPageCount] = useState(1);

  const generateSample = async () => {
    const pdfDoc = await PDFDocument.create()
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      const page = pdfDoc.addPage()

      for (let i = 0; i < 49; i++) {
        page.drawText(
          generateText(70),
          {
            x: 25,
            y: 800 - i * 16,
            font: helveticaFont,
            rotate: degrees(0),
            size: 12,
            color: rgb(0, 0, 0),
            lineHeight: 12,
            opacity: 1,
          },
        )
      }
    }


    const pdfBytes = await pdfDoc.save()

    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

    await saveBlobToFileWithDialog(blob);
  }

  return <Section variant={"default"} className="flex flex-col gap-4 lg:gap-8 pt-2">
    <h1 className="header-section-1">{t("title")}</h1>

    <span className="flex flex-col gap-2">
      <Label htmlFor="pages">{t("input.pagecount.label")}</Label>
      <Input
        id="pages"
        type="number"
        min={1}
        max={10000}
        value={pageCount}
        onChange={(event) => { setPageCount(parseInt(event.target.value)) }} />
    </span>

    <span>
      <Button onClick={generateSample}>{t("action.generate")}</Button>
    </span>
  </Section>
}