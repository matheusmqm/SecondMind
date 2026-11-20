import { Chip, Label, SearchField, Skeleton } from '@heroui/react'
import { useMemo, useState } from 'react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { errorMessage } from '@/lib/utils'
import { useDocuments } from '../useDocuments'
import { Dropzone } from './Dropzone'
import { FileCard } from './FileCard'

export function Library() {
  const documents = useDocuments()
  const [query, setQuery] = useState('')

  const shown = useMemo(() => {
    const term = query.trim().toLowerCase()
    const all = documents.data ?? []
    return term ? all.filter((d) => d.filename.toLowerCase().includes(term)) : all
  }, [documents.data, query])

  const total = documents.data?.length ?? 0

  return (
    <div>
      <Dropzone compact={total > 0} />

      <div className="mt-6 mb-3 flex items-center justify-between">
        <h2 className="m-0 text-xs font-semibold uppercase tracking-wider text-muted">Uploaded files</h2>
        {total > 0 && (
          <Chip size="sm" aria-live="polite">
            {shown.length === total ? `${total} ${total === 1 ? 'file' : 'files'}` : `${shown.length} of ${total}`}
          </Chip>
        )}
      </div>

      {total > 4 && (
        <SearchField fullWidth className="mb-4" value={query} onChange={setQuery} aria-label="Search files by name">
          <Label className="sr-only">Search files by name</Label>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search by file name" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      )}

      <section aria-label="File list">
        {documents.isPending && (
          <div className="space-y-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {documents.isError && <ErrorAlert>{errorMessage(documents.error)}</ErrorAlert>}

        {documents.data && total === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-muted">
            <p className="m-0 font-medium text-foreground">No documents uploaded</p>
            <p className="m-0 mt-1 text-sm">Upload your first file above to start asking questions about your base.</p>
          </div>
        )}

        {total > 0 && shown.length === 0 && <p className="m-0 text-muted">No documents found for “{query}”.</p>}

        {shown.length > 0 && (
          <div className="space-y-2">
            {shown.map((doc) => (
              <FileCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
