import path from 'path'
import { PDFDocument } from 'pdf-lib'
import archiver from 'archiver'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import {createWriteStream} from 'fs'
import { v4 as uuidv4 } from 'uuid'


async function splitPdf(file: File): Promise<string> {
  try {
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const pdfDoc = await PDFDocument.load(buffer);

    // Crear un directorio temporal
    const tmpDir = await fs.mkdtemp(path.join( process.cwd(), 'pdf_split_'));

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const newPdfDoc = await PDFDocument.create()
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i])
      newPdfDoc.addPage(copiedPage)
      const pdfBytes = await newPdfDoc.save()
      const outputFileName = `page_${i + 1}.pdf`
  
      await fs.writeFile(path.join(tmpDir, outputFileName), pdfBytes)

    }

    return tmpDir;
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

  const dirPath = await splitPdf(file)

  const fileName = `${uuidv4()}.zip`

  const output = createWriteStream(fileName)

  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  })

  archive.on('error', function(err){
    throw err;
  });

  archive.pipe(output)

  archive.directory(dirPath, false)
  archive.finalize()

  await new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  })

  await fs.rm(dirPath, { recursive: true, force: true })

  return NextResponse.json({fileName})
}
