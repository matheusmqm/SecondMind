import { Button, buttonVariants, Skeleton, useOverlayState } from '@heroui/react'
import { ArrowLeft, Download, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { FileTypeChip } from '@/components/ui/FileTypeChip'
import { errorMessage } from '@/lib/utils'
import { DeleteDialog } from '../components/DeleteDialog'
import { PdfViewer } from '../components/PdfViewer'
import { SheetViewer } from '../components/SheetViewer'
import { useDeleteDocument, useDocuments, useDownloadDocument } from '../useDocuments'

export default function DocumentPage() {
  const { id = '' } = useParams()
  const [searchParams] = useSearchParams()
  const page = Number.parseInt(searchParams.get('page') ?? '', 10) || undefined
  const navigate = useNavigate()
  const documents = useDocuments()
  const download = useDownloadDocument()
  const remove = useDeleteDocument()
  const dialog = useOverlayState()
  const doc = documents.data?.find((item) => item.id === id)

  if (documents.isPending) {
    return (
      <div className="space-y-4" aria-hidden>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-60 w-full rounded-2xl" />
      </div>
    )
  }
  if (documents.isError) return <ErrorAlert>{errorMessage(documents.error)}</ErrorAlert>
  if (!doc) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="m-0 font-medium">Document not found</p>
        <p className="mt-1 mb-4 text-sm text-muted">It may have been deleted.</p>
        <Link to="/" className={buttonVariants({ variant: 'secondary' })}>
          Back to documents
        </Link>
      </div>
    )
  }

  const isSpreadsheet = doc.file_type === 'xlsx' || doc.file_type === 'csv'

  return (
    <div>
      <Link to="/" className={buttonVariants({ variant: 'ghost', size: 'sm', className: '-ml-3 mb-3' })}>
        <ArrowLeft className="size-4" aria-hidden />
        Documents
      </Link>

      <header className="mb-6 flex flex-wrap items-center gap-4">
        <FileTypeChip ext={doc.file_type ?? 'pdf'} size="lg" />
        <h1 className="m-0 min-w-0 flex-1 text-2xl font-semibold [overflow-wrap:anywhere]">{doc.filename}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" isPending={download.isPending} onPress={() => download.mutate(doc.id)}>
            <Download className="size-4" aria-hidden />
            Download
          </Button>
          <Button variant="danger-soft" size="sm" onPress={dialog.open}>
            <Trash2 className="size-4" aria-hidden />
            Delete
          </Button>
        </div>
      </header>

      <DeleteDialog
        state={dialog}
        filename={doc.filename}
        isPending={remove.isPending}
        onConfirm={() => remove.mutate(doc.id, { onSuccess: () => navigate('/', { replace: true }) })}
      />

      {isSpreadsheet ? (
        doc.status === 'ready' ? (
          <SheetViewer key={`sheet-${doc.id}`} documentId={doc.id} />
        ) : (
          <ErrorAlert>{doc.status === 'failed' ? doc.error : 'The file is still being processed.'}</ErrorAlert>
        )
      ) : (
        <PdfViewer key={`pdf-${doc.id}`} documentId={doc.id} title={doc.filename} page={page} />
      )}
    </div>
  )
}
