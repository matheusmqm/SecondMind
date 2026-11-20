import { Card, Spinner } from '@heroui/react'
import { useEffect, useState } from 'react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { getDocumentUrl } from '../api'

// The PDF is downloaded into a local blob: Storage may serve the file with
// headers that prevent displaying it directly inside an iframe.
export function PdfViewer({ documentId, title, page }) {
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    let objectUrl

    getDocumentUrl(documentId, true)
      .then(({ url }) => fetch(url, { signal: controller.signal }))
      .then((response) => {
        if (!response.ok) throw new Error('download')
        return response.blob()
      })
      .then((blob) => {
        if (controller.signal.aborted) return
        objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
        setState({ status: 'ready', src: objectUrl })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: 'error' })
      })

    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [documentId])

  if (state.status === 'error') {
    return <ErrorAlert>Could not display the PDF. You can still download it.</ErrorAlert>
  }

  return (
    <Card className="relative h-[78vh] min-h-[420px] overflow-hidden p-0">
      {state.status === 'loading' ? (
        <div className="grid h-full place-items-center" role="status">
          <Spinner />
        </div>
      ) : (
        <iframe
          key={page}
          title={title}
          src={page ? `${state.src}#page=${page}` : state.src}
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </Card>
  )
}
