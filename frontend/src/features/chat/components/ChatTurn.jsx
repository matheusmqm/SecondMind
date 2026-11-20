import { Accordion, Button, buttonVariants } from '@heroui/react'
import { ChevronDown, FileSpreadsheet, FileText, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ErrorAlert } from '@/components/ui/ErrorAlert'
import { Answer } from './Answer'
import { Thinking, useElapsed } from './Thinking'

const pageLabel = (s) => (s.page_start === s.page_end ? `p. ${s.page_start}` : `pp. ${s.page_start}-${s.page_end}`)

const sourceLabel = (s) => (s.kind === 'sheet' ? `sheet ${s.sheet_name}` : pageLabel(s))

const seconds = (ms) => (ms == null ? null : `${(ms / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })} s`)

const money = (usd) => `~US$ ${usd.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`

const TOOL_LABELS = {
  routing: 'Chose the spreadsheet agent',
  search_documents: 'Searched the documents',
  list_tables: 'Listed the spreadsheet tables',
  describe_table: 'Inspected a table',
  run_sql: 'Ran a query',
}

// "How I got this": each tool call the agent made, with the SQL it ran.
function Trace({ trace }) {
  return (
    <Accordion className="mb-3">
      <Accordion.Item id="trace">
        <Accordion.Heading>
          <Accordion.Trigger>
            How this answer was built ({trace.length} {trace.length === 1 ? 'step' : 'steps'})
            <Accordion.Indicator>
              <ChevronDown className="size-4" aria-hidden />
            </Accordion.Indicator>
          </Accordion.Trigger>
        </Accordion.Heading>
        <Accordion.Panel>
          <Accordion.Body>
            <ol className="m-0 list-decimal space-y-2 pl-5 text-sm">
              {trace.map((step, index) => (
                <li key={index} className={step.error ? 'text-danger' : undefined}>
                  <span className="font-medium">{TOOL_LABELS[step.tool] ?? step.tool}</span>
                  <span className="text-muted"> · {step.summary}</span>
                  {(step.tool === 'search_documents' || step.tool === 'run_sql') && step.input?.query && (
                    <code className="mt-1 block overflow-x-auto rounded-lg bg-default p-2 font-mono text-xs whitespace-pre-wrap text-foreground">
                      {step.input.query}
                    </code>
                  )}
                </li>
              ))}
            </ol>
          </Accordion.Body>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export function ChatTurn({ message, onRetry }) {
  const pending = message.status === 'pending'
  const elapsed = useElapsed(pending)

  return (
    <>
      <p className="m-0 mb-4 ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-accent-soft px-4 py-2 text-accent-soft-foreground [overflow-wrap:anywhere]">
        {message.question}
      </p>

      {pending && <Thinking label="Searching the documents" seconds={elapsed} />}

      {message.status === 'done' && message.answer && (
        <>
          <Answer text={message.answer} />
          {message.sources?.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2" aria-label="Sources">
              {message.sources.map((source) => {
                const Icon = source.kind === 'sheet' ? FileSpreadsheet : FileText
                return (
                  <Link
                    key={source.ref}
                    to={
                      source.kind === 'sheet'
                        ? `/documents/${source.document_id}`
                        : `/documents/${source.document_id}?page=${source.page_start}`
                    }
                    className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                    title={source.sql ? `${source.filename}\n${source.sql}` : `Open ${source.filename}`}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    <span>
                      [{source.ref}] {source.filename}, {sourceLabel(source)}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
          {message.trace?.length > 0 && <Trace trace={message.trace} />}
          <div className="mb-5 flex flex-wrap gap-x-3 text-xs text-muted">
            {message.latencyMs != null && <span>{seconds(message.latencyMs)}</span>}
            {message.usage && (
              <span title={`${message.usage.input_tokens} input / ${message.usage.output_tokens} output tokens`}>
                {message.usage.steps} {message.usage.steps === 1 ? 'call' : 'calls'} to the model,{' '}
                {money(message.usage.cost_usd)}
              </span>
            )}
          </div>
        </>
      )}

      {message.status === 'error' && (
        <div className="mb-5">
          <ErrorAlert>{message.error}</ErrorAlert>
          <Button size="sm" variant="ghost" className="mt-2" onPress={() => onRetry(message.id)}>
            <RotateCcw className="size-4" aria-hidden />
            Try again
          </Button>
        </div>
      )}
    </>
  )
}
