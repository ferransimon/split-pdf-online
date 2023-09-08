import { PdfReader } from "pdfreader"

const extractNames = async (pdfFile: File) => {
    const bytes = await pdfFile.arrayBuffer()
    const buffer = Buffer.from(bytes)


    const names = await new Promise<string[]>((resolve, reject) => {
        const data: string[] = []
        let shouldParseNext = false
        new PdfReader(null).parseBuffer(buffer, (err, item) => {
            if (err) reject(err)
            else if (!item) resolve(data)
            else if (item.text) {
                if (shouldParseNext) {
                    data.push(item.text)
                    shouldParseNext = false
                }

                if (item.text.includes('B65337511')) shouldParseNext = true
            }
        })
    })

    return names

    
}

export {extractNames}