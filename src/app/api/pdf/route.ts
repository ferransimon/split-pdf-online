import { PDFDocument } from 'pdf-lib'
import archiver from 'archiver'
import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'
import MemoryStream from 'memorystream'

async function splitPdf(file: File): Promise<MemoryStream> {
  try {

    const outputStream = new MemoryStream()
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const pdfDoc = await PDFDocument.load(buffer);

    const zip = archiver('zip', { zlib: { level: 9 } })
    zip.pipe(outputStream)

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const newPdfDoc = await PDFDocument.create()
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i])
      newPdfDoc.addPage(copiedPage)
      const pdfBytes = await newPdfDoc.save()
      const pdfStream = Readable.from(Buffer.from(pdfBytes))
      
      const outputFileName = `page_${i + 1}.pdf`
  
      zip.append(pdfStream, { name: outputFileName })

    }

    zip.finalize()

    await new Promise<void>((resolve, reject) => {
      zip.on('finish', resolve)
      outputStream.on('close', resolve);
      outputStream.on('finish', resolve);
      outputStream.on('error', reject);
    })

    outputStream.end()

    return outputStream;
  } catch (error) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File

  if (!file) {
    return NextResponse.json({ success: false })
  }

  const outputStream = await splitPdf(file)

  const readableStream = new MemoryStream()

  outputStream.pipe(readableStream)
  
  return new Response(readableStream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=output.zip'
    }
  })
}
