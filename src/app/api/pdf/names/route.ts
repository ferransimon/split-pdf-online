import { NextRequest, NextResponse } from 'next/server'
import { extractNames } from '../../../utils/pdf'

export async function POST(request: NextRequest) {
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File
  
  if (!file) {
    return NextResponse.json({ success: false })
  }

  return NextResponse.json({
    names: await extractNames(file)
  })
  
}
