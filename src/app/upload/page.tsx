"use client"

import { useState, ChangeEvent, FormEvent } from 'react'

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
        const {fileName} = await response.json()
        location.href = `/api/pdf/download?fileName=${fileName}`
      } else {
        alert('Hubo un error al procesar el archivo PDF.')
      }
    } catch (error) {
      console.error(error)
      alert('Hubo un error al enviar el formulario.')
    }
  };

  return (
    <div>
      <h1>Subir un archivo PDF</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}