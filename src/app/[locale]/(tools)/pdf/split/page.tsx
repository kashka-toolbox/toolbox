"use client"

import DropArea from "@/components/ui/droparea";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/Section";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  BlobReader,
  BlobWriter,
  ZipWriter,
} from "@zip.js/zip.js";
import { saveBlobToFileWithDialog } from "@/lib/files/saveBlobToFileWithDialog";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const MaxPagesForSingleDownload = 20;

export default function PDFSplit() {
  const t = useTranslations("tools.pdf.split");
  const [file, setFile] = useState<File>();
  const [fileNameWithoutExtension, setFileNameWithoutExtension] = useState<string>();
  const [pdfFile, setPdfFile] = useState<PDFDocument>();
  const [splitPageDocs, setSplitPageDocs] = useState<PDFDocument[]>([]);
  const [splitPageDocsPreview, setSplitPageDocsPreview] = useState<string[]>([]);

  useEffect(() => {
    if (file == undefined) {
      setSplitPageDocsPreview([]);
      setSplitPageDocs([]);
      setPdfFile(undefined);
      return;
    }

    (async () => {
      const newPdfFile = await PDFDocument.load(await file.arrayBuffer());


      setPdfFile(newPdfFile);
      setFileNameWithoutExtension(file.name.split(".").slice(0, -1).join("."));

      const newPages = await Promise.all(newPdfFile.getPages().map(async (_, i) => {
        const splittedPdfDoc = await PDFDocument.create();
        splittedPdfDoc.setTitle((newPdfFile.getTitle() ?? "") + ` - ${i + 1}`);

        const copiedPages = await splittedPdfDoc.copyPages(newPdfFile, [i]);
        splittedPdfDoc.addPage(copiedPages[0]);

        return splittedPdfDoc;
      }));

      setSplitPageDocs(newPages);

      const newPagesPreview = await Promise.all(newPages.map(async (pdf) => {
        const bytes = new Uint8Array(await pdf.save());
        const blob = new Blob([bytes], { type: "application/pdf" });
        return URL.createObjectURL(blob);
      }))

      setSplitPageDocsPreview(newPagesPreview);
    })();
  }, [file]);



  const downloadAllSplitPages = async (file: File) => {
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const splittedPDFs = await Promise.all(pdfDoc.getPages().map(async (_, i) => {
      const splittedPdfDoc = await PDFDocument.create();
      splittedPdfDoc.setTitle((pdfDoc.getTitle() ?? "") + ` - ${i + 1}`);

      const copiedPages = await splittedPdfDoc.copyPages(pdfDoc, [i]);
      splittedPdfDoc.addPage(copiedPages[0]);

      return splittedPdfDoc;
    }));

    const zipFileWriter = new BlobWriter();
    const zipWriter = new ZipWriter(zipFileWriter);

    for (let i = 0; i < splittedPDFs.length; i++) {
      const pdf = splittedPDFs[i];
      const pdfBytes = await pdf.save();
      const pdfReader = new BlobReader(new Blob([pdfBytes as BlobPart]));
      await zipWriter.add(`${fileNameWithoutExtension}-${i + 1}.pdf`, pdfReader);
    }

    await zipWriter.close();
    const zipFileBlob = await zipFileWriter.getData();

    saveBlobToFileWithDialog(zipFileBlob, `split_${fileNameWithoutExtension}.zip`, [{ description: 'ZIP Archive', accept: { 'application/zip': ['.zip'] } }]);
  }

  return <Section variant={"default"} className="flex flex-col gap-4 lg:gap-8 pt-2">
    <h1 className="header-section-1">{t("title")}</h1>

    <DropArea
      onFilesAdded={(files) => {
        setFile(files[0]);
      }}
      multiple={false}
      accept=".pdf">
      {file?.name ?? t("actions.dropFiles")}
    </DropArea>

    {
      file != undefined && <>
        <Separator orientation="horizontal" />

        <div className="flex justify-between items-center">
          <span className="font-bold">
            {file.name} ({pdfFile?.getPageCount()} pages)
          </span>
          <Button onClick={() => downloadAllSplitPages(file)}>
            {t("actions.downloadAll")}
          </Button>
        </div>

        <Separator orientation="horizontal" />

        {pdfFile &&
          pdfFile.getPageCount() <= MaxPagesForSingleDownload
          ? <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
            {splitPageDocs.map((page, index) => {
              return <Card key={index}>
                <CardHeader>
                  <CardTitle>Page {index + 1}</CardTitle>
                </CardHeader>
                <CardContent className="w-full">
                  <iframe
                    title={`Page ${index + 1}`}
                    src={splitPageDocsPreview[index] + "#view=Fit&toolbar=0&navpanes=0"}
                    className={`rounded w-full aspect-[3/3]`} />
                </CardContent>
                <CardFooter className="flex justify-between items-center w-full">
                  <span className="text-ellipsis overflow-hidden text-nowrap min-w-0 mr-1">{`${fileNameWithoutExtension}_${index + 1}.pdf`}</span>
                  <Button onClick={async () => {
                    saveBlobToFileWithDialog(new Blob([new Uint8Array(await page.save())]), `${fileNameWithoutExtension}_${index + 1}.pdf`, [{ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } }])
                  }}>Download</Button>
                </CardFooter>
              </Card>
            })}
          </div>
          : "Too many pages to display. Please download all files."
        }
      </>
    }
  </Section>
}