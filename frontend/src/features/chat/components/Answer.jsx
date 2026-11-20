import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

// Markdown tables come from the parser as plain <table> nodes, which HeroUI's collection-based
// <Table> cannot consume, so they are styled with the same tokens instead.
const NUMBER = /^[-+]?[R$\s\d.,%]+$/

/** Assistant answer in Markdown (lists, bold, tables). */
export function Answer({ text }) {
  return (
    <div className="mb-3 text-[15px] leading-relaxed [&_li]:my-1 [&_ol]:my-2 [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          th: ({ children }) => (
            <th className="border-b border-separator bg-surface-secondary px-3 py-2 text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children, style }) => {
            const isNumber = typeof children === 'string' && NUMBER.test(children.trim())
            return (
              <td style={style} className={cn('border-b border-separator px-3 py-2', isNumber && 'text-right tabular-nums')}>
                {children}
              </td>
            )
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-separator">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer noopener" className="link">
              {children}
            </a>
          ),
          code: ({ children }) => <code className="rounded bg-default px-1 font-mono text-[0.9em]">{children}</code>,
        }}
      >
        {text}
      </Markdown>
    </div>
  )
}
