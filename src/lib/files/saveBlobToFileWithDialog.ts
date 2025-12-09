"use client";

export async function saveBlobToFileWithDialog(blob: Blob, suggestedName: string = 'sample.pdf', types: FilePickerAcceptType[] = [{ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } }]) {
  if (window.showSaveFilePicker) {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: types,
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } else {
    // Fallback if showSaveFilePicker is not available
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = suggestedName;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}