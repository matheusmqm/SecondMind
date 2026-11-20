import { Button, Chip, Spinner, Surface } from '@heroui/react'
import { CircleCheck, CircleX, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { FileTypeChip } from '@/components/ui/FileTypeChip'
import { cn, fileExtension, MAX_UPLOAD_MB } from '@/lib/utils'
import { ACCEPT_ATTR, useUploadQueue } from '../useDocuments'

// Drag-and-drop area (the free HeroUI set has no DropZone, so the area is a styled Surface).
export function Dropzone({ compact = false }) {
  const queue = useUploadQueue()
  const input = useRef(null)
  const [over, setOver] = useState(false)

  const pick = (files) => {
    if (files && files.length) queue.add(Array.from(files))
  }
  const onDrop = (event) => {
    event.preventDefault()
    setOver(false)
    pick(event.dataTransfer.files)
  }
  const onKey = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      input.current?.click()
    }
  }

  return (
    <div>
      <Surface
        variant="secondary"
        role="button"
        tabIndex={0}
        aria-label="Upload files (PDF, Excel or CSV): drag them here or click to choose"
        className={cn(
          'flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed border-border p-6 outline-none transition-colors hover:border-accent focus-visible:border-accent',
          compact ? 'flex-row text-left' : 'flex-col text-center',
          over && 'border-accent bg-accent-soft',
        )}
        onClick={() => input.current?.click()}
        onKeyDown={onKey}
        onDragOver={(event) => {
          event.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <Upload className="size-6 shrink-0 text-accent" aria-hidden />
        <div className={cn('flex flex-col gap-2', compact ? 'items-start' : 'items-center')}>
          <p className="m-0 font-medium">
            {over ? 'Drop the files to upload' : 'Drag PDF, Excel or CSV files here or click to select'}
          </p>
          <div className="flex gap-1.5">
            <FileTypeChip ext="pdf" />
            <FileTypeChip ext="xlsx" />
            <FileTypeChip ext="csv" />
          </div>
          {!compact && (
            <p className="m-0 text-sm text-muted">
              PDF, Excel (.xlsx) or CSV, up to {MAX_UPLOAD_MB} MB per file. You can upload several at once.
            </p>
          )}
        </div>
        <input
          ref={input}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          hidden
          onChange={(event) => {
            pick(event.target.files)
            event.target.value = '' // lets the same file be picked again
          }}
        />
      </Surface>

      {queue.rejected.length > 0 && (
        <div className="mt-3">
          <ErrorAlert>
            <ul className="m-0 list-none space-y-1 p-0">
              {queue.rejected.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
            <Button size="sm" variant="ghost" className="mt-1" onPress={queue.clearRejected}>
              Dismiss
            </Button>
          </ErrorAlert>
        </div>
      )}

      {queue.items.length > 0 && (
        <ul className="m-0 mt-3 list-none space-y-2 p-0" aria-label="Uploads in progress">
          {queue.items.map((item) => (
            <li key={item.id}>
              <Surface className="flex items-center gap-3 rounded-xl px-3 py-2">
                <FileTypeChip ext={fileExtension(item.name)} />
                <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
                {item.status === 'uploading' && (
                  <Chip size="sm" role="status">
                    <Spinner size="sm" color="current" /> Uploading…
                  </Chip>
                )}
                {item.status === 'done' && (
                  <Chip size="sm" color="success" variant="soft">
                    <CircleCheck className="size-3.5" aria-hidden /> Uploaded
                  </Chip>
                )}
                {item.status === 'error' && (
                  <>
                    <Chip size="sm" color="danger" variant="soft" title={item.error}>
                      <CircleX className="size-3.5" aria-hidden />
                      <span className="max-w-64 truncate">{item.error}</span>
                    </Chip>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      aria-label={`Dismiss notice for ${item.name}`}
                      onPress={() => queue.dismiss(item.id)}
                    >
                      <X className="size-4" aria-hidden />
                    </Button>
                  </>
                )}
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
