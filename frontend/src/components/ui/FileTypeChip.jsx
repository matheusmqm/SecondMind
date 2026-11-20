import { Chip } from '@heroui/react'

// The file type as a small chip with its extension.
export function FileTypeChip({ ext, size = 'sm' }) {
  return (
    <Chip size={size} variant="soft" aria-label={`${ext.toUpperCase()} file`}>
      <span className="font-mono uppercase">{ext}</span>
    </Chip>
  )
}
