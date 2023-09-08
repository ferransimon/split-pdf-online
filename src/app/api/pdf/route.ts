import { PDFDocument } from 'pdf-lib'
import archiver from 'archiver'
import { NextRequest, NextResponse } from 'next/server'
import { Readable } from 'stream'
import MemoryStream from 'memorystream'
import { extractNames } from '../../utils/pdf'

async function splitPdf(file: File, parseNames: boolean): Promise<MemoryStream> {
  try {

    const outputStream = new MemoryStream()
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileNamesByPagePromise: Promise<string[]> = parseNames ? 
      extractNames(file) : 
      new Promise((resolve) => resolve([]))

    const pdfDoc = await PDFDocument.load(buffer);

    const zip = archiver('zip', { zlib: { level: 9 } })
    zip.pipe(outputStream)

    const pdfStreams = []

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const newPdfDoc = await PDFDocument.create()
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i])
      newPdfDoc.addPage(copiedPage)
      const pdfBytes = await newPdfDoc.save()
      
      const pdfStream = Readable.from(Buffer.from(pdfBytes))
      
      pdfStreams.push(pdfStream)
    }

    if (parseNames) {
      const fileNamesByPage = await fileNamesByPagePromise
      pdfStreams.forEach((stream, idx) => {
        zip.append(stream, { name: `${fileNamesByPage[idx]}.pdf` })
      })
    } else {
      pdfStreams.forEach((stream, idx) => {
        zip.append(stream, { name: `page_${idx}.pdf` })
      })
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
  const extractNames: boolean = data.get('extractNames') as string == '1'

  if (!file) {
    return NextResponse.json({ success: false })
  }

  const outputStream = await splitPdf(file, extractNames)

  const readableStream = new MemoryStream()

  outputStream.pipe(readableStream)
  // @ts-ignore
  return new Response(readableStream, { 
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=output.zip'
    }
  })
}
