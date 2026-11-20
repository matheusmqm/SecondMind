import { Button, Card, Chip, Spinner, Tooltip, useOverlayState } from '@heroui/react'
import { Download, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FileTypeChip } from '@/components/ui/FileTypeChip'
import { formatDate } from '@/lib/utils'
import { useDeleteDocument, useDownloadDocument } from '../useDocuments'
import { DeleteDialog } from './DeleteDialog'

function StatusChip({ doc }) {
  if (doc.status === 'pending' || doc.status === 'processing') {
    return (
      <Chip size="sm" role="status">
        <Spinner size="sm" color="current" /> Processing
      </Chip>
    )
  }
  if (doc.status === 'failed') {
    return (
      <Chip size="sm" color="danger" variant="soft">
        Failed
      </Chip>
    )
  }
  if (doc.file_type && doc.file_type !== 'pdf') {
    if (!doc.sheet_count) return null
    const sheets = `${doc.sheet_count} ${doc.sheet_count === 1 ? 'sheet' : 'sheets'}`
    return (
      <Chip size="sm">
        {sheets}, {doc.row_count?.toLocaleString('en-US')} rows
      </Chip>
    )
  }
  return doc.page_count ? (
    <Chip size="sm">
      {doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}
    </Chip>
  ) : null
}

// Document card: opens the file; download and delete sit beside it.
export function FileCard({ doc }) {
  const download = useDownloadDocument()
  const remove = useDeleteDocument()
  const dialog = useOverlayState()

  return (
    <Card className="flex-row items-center gap-3 p-3">
      <FileTypeChip ext={doc.file_type ?? 'pdf'} />
      <div className="min-w-0 flex-1">
        <Link
          to={`/documents/${doc.id}`}
          aria-label={`Open ${doc.filename}`}
          className="block truncate font-medium hover:underline"
          title={doc.filename}
        >
          {doc.filename}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          <span>{formatDate(doc.created_at)}</span>
          <StatusChip doc={doc} />
        </div>
        {doc.status === 'failed' && doc.error && <p className="m-0 mt-1 text-xs text-danger">{doc.error}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Tooltip>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={`Download ${doc.filename}`}
            isPending={download.isPending}
            onPress={() => download.mutate(doc.id)}
          >
            <Download className="size-4" aria-hidden />
          </Button>
          <Tooltip.Content>Download</Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Button
            isIconOnly
            size="sm"
            variant="danger-soft"
            aria-label={`Delete ${doc.filename}`}
            onPress={dialog.open}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
          <Tooltip.Content>Delete</Tooltip.Content>
        </Tooltip>
      </div>

      <DeleteDialog
        state={dialog}
        filename={doc.filename}
        isPending={remove.isPending}
        onConfirm={() => remove.mutate(doc.id, { onSettled: dialog.close })}
      />
    </Card>
  )
}
