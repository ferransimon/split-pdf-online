"use client"

import { useState, ChangeEvent, FormEvent } from 'react'
import { saveFile } from './utils/files';


export default function Upload() {
  const [file, setFile] = useState<File | null | undefined>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    setFile(selectedFile);
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      alert('Selecciona un archivo PDF antes de enviar el formulario.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const blob = await response.blob()
        await saveFile(blob)
      } else {
        alert('Hubo un error al procesar el archivo PDF.')
      }
    } catch (error) {
      console.error(error)
      alert('Hubo un error al enviar el formulario.')
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1>Subir un archivo PDF</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
        <input
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          id="file"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Enviar</button>
      </form>
    </div>
  )
}