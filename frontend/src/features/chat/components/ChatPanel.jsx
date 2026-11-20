import { Button, Card, Separator, TextArea, Tooltip } from '@heroui/react'
import { ArrowUp, Eraser } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useChat } from '../useChat'
import { ChatTurn } from './ChatTurn'

const SUGGESTIONS = [
  'What topics do the documents cover?',
  'Summarize the main points',
  'Do the figures in the reports match the spreadsheets?',
]

export function ChatPanel() {
  const chat = useChat()
  const [text, setText] = useState('')
  const body = useRef(null)
  const area = useRef(null)
  const stick = useRef(true)

  const last = chat.messages[chat.messages.length - 1]

  // Follow the end of the conversation, unless the user has scrolled up.
  useEffect(() => {
    const el = body.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [chat.messages.length, last?.status])

  // Field height grows with the text, up to 128px.
  useEffect(() => {
    const el = area.current
    if (!el) return
    el.style.height = '40px'
    if (text) el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }, [text])

  const send = (question = text) => {
    const clean = question.trim()
    if (!clean || chat.pending) return
    setText('')
    stick.current = true
    void chat.ask(clean)
  }
  const onKey = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send()
    }
  }

  return (
    <Card className="gap-0 p-0" aria-label="Questions about the documents" role="region">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <h2 className="m-0 text-base font-semibold">Ask your documents</h2>
          <p className="m-0 truncate text-sm text-muted">
            Answers from your PDFs and spreadsheets, with the source of each number
          </p>
        </div>
        {chat.messages.length > 0 && (
          <Tooltip>
            <Button isIconOnly size="sm" variant="ghost" aria-label="Clear the conversation" onPress={chat.clear}>
              <Eraser className="size-4" aria-hidden />
            </Button>
            <Tooltip.Content>Clear the conversation</Tooltip.Content>
          </Tooltip>
        )}
      </div>
      <Separator />

      <div
        ref={body}
        className="h-[min(60vh,520px)] overflow-y-auto p-4"
        onScroll={(event) => {
          const el = event.currentTarget
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
        }}
        aria-live="polite"
      >
        {chat.messages.length === 0 && (
          <>
            <p className="m-0 mb-3 text-sm text-muted">Ask about any file in your base or pick a suggestion:</p>
            <div className="flex flex-col items-start gap-2" aria-label="Suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  size="sm"
                  variant="secondary"
                  className="h-auto whitespace-normal py-1.5 text-left"
                  onPress={() => send(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </>
        )}

        {chat.messages.map((message) => (
          <ChatTurn key={message.id} message={message} onRetry={chat.retry} />
        ))}
      </div>

      <Separator />
      <div className="flex items-end gap-2 p-3">
        <TextArea
          ref={area}
          fullWidth
          rows={1}
          value={text}
          placeholder="Type your question"
          aria-label="Your question"
          className="max-h-32 min-h-10 resize-none"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKey}
        />
        <Button isIconOnly aria-label="Send question" isDisabled={!text.trim() || chat.pending} onPress={() => send()}>
          <ArrowUp className="size-4" aria-hidden />
        </Button>
      </div>
    </Card>
  )
}
