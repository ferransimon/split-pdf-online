import path from 'path'
import fs from 'fs/promises'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const fileName = searchParams.get('fileName')
    if (!fileName) throw new Error('fileName must be presend')
    const pathToZip = path.join( process.cwd(), fileName)
    const file = await fs.readFile(pathToZip)
    await fs.unlink(pathToZip)
    return new Response(file, {
        headers: {
        'Content-Type': 'application/zip',
        "content-disposition": `attachment; filename="output.zip"`,
        },
    })
}