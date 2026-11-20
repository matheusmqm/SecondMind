import { ChatPanel } from '@/features/chat/components/ChatPanel'
import { Library } from '../components/Library'

export default function LibraryPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="m-0 text-3xl font-semibold tracking-tight">Documents</h1>
        <p className="mt-2 mb-0 text-muted">
          Upload PDFs and Excel/CSV spreadsheets, then ask questions that cross all of them at once.
        </p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Library />
        <div className="lg:sticky lg:top-20">
          <ChatPanel />
        </div>
      </div>
    </div>
  )
}
