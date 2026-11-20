import { Card, Spinner, Table, Tabs } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { cn, errorMessage } from '@/lib/utils'
import { getPreview } from '../api'

const cell = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return value.toLocaleString('en-US', { maximumFractionDigits: 4 })
  return String(value)
}

function SheetTable({ sheet }) {
  return (
    <>
      <Table>
        <Table.ScrollContainer className="max-h-[65vh] overflow-auto">
          <Table.Content aria-label={`Preview of ${sheet.name}`} className="min-w-[600px]">
            <Table.Header>
              {sheet.columns.map((column, index) => (
                <Table.Column key={column} id={column} isRowHeader={index === 0}>
                  {column}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body>
              {sheet.rows.map((row, rowIndex) => (
                <Table.Row key={rowIndex} id={rowIndex}>
                  {row.map((value, i) => (
                    <Table.Cell key={i} className={cn(typeof value === 'number' && 'text-right tabular-nums')}>
                      {cell(value)}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <p className="m-0 mt-2 text-xs text-muted">
        Showing {sheet.rows.length.toLocaleString('en-US')} of {sheet.total_rows.toLocaleString('en-US')} rows. Column
        names are normalized (lowercase, no accents) so they can be used in queries.
      </p>
    </>
  )
}

// Read-only preview of a spreadsheet: one tab per sheet, first rows only.
export function SheetViewer({ documentId }) {
  const preview = useQuery({
    queryKey: ['preview', documentId],
    queryFn: () => getPreview(documentId),
    staleTime: 5 * 60 * 1000,
  })

  if (preview.isPending) {
    return (
      <Card className="grid min-h-60 place-items-center" role="status">
        <Spinner />
      </Card>
    )
  }
  if (preview.isError) return <ErrorAlert>{errorMessage(preview.error)}</ErrorAlert>

  const sheets = preview.data.sheets

  if (sheets.length === 1) {
    return (
      <Card>
        <SheetTable sheet={sheets[0]} />
      </Card>
    )
  }

  return (
    <Card>
      <Tabs defaultSelectedKey={sheets[0].name}>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Sheets">
            {sheets.map((sheet) => (
              <Tabs.Tab key={sheet.name} id={sheet.name}>
                {sheet.name}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        {sheets.map((sheet) => (
          <Tabs.Panel key={sheet.name} id={sheet.name} className="pt-4">
            <SheetTable sheet={sheet} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Card>
  )
}
