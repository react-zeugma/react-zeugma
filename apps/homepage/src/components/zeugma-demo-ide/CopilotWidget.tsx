'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Trash2,
  Bot,
  Sparkles,
  User,
  HelpCircle,
  Code,
  Plus,
  CircleSlash,
  Settings2,
  ArrowUp,
} from 'lucide-react'
import { useZeugmaContext } from 'react-zeugma'

interface Message {
  id: string
  sender: 'user' | 'copilot'
  text: string
  timestamp: Date
}

const INITIAL_MESSAGES = (layoutInfo: string): Message[] => [
  {
    id: 'welcome',
    sender: 'copilot',
    text: `Hi! I am your **Zeugma Copilot**. ⚡\n\nI can help you understand the workspace layout, split panes, and use the demo IDE. Let me know what you want to build or analyze.\n\n${layoutInfo}`,
    timestamp: new Date(),
  },
]

export function CopilotWidget() {
  const { layout, locked } = useZeugmaContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null)
  const [streamedText, setStreamedText] = useState('')

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamingFullTextRef = useRef<string>('')

  const streamMessage = (msg: Message) => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current)
    const fullText = msg.text
    streamingFullTextRef.current = fullText
    setStreamingMsgId(msg.id)
    setStreamedText('')
    let index = 0
    streamIntervalRef.current = setInterval(() => {
      index++
      setStreamedText(fullText.slice(0, index))
      if (index >= fullText.length) {
        clearInterval(streamIntervalRef.current!)
        streamIntervalRef.current = null
        streamingFullTextRef.current = ''
        setStreamingMsgId(null)
      }
    }, 12)
  }

  const stopStreaming = () => {
    if (!streamIntervalRef.current) return
    clearInterval(streamIntervalRef.current)
    streamIntervalRef.current = null
    setStreamedText(streamingFullTextRef.current)
    streamingFullTextRef.current = ''
    setStreamingMsgId(null)
  }

  const startWelcomeStream = (msgs: Message[]) => {
    setMessages(msgs)
    if (msgs.length > 0) streamMessage(msgs[0])
  }

  // Get a readable description of the layout state
  const getLayoutSummary = () => {
    let panes: string[] = []
    let splitsCount = 0

    function traverse(n: any) {
      if (!n) return
      if (n.type === 'pane') {
        // Collect current active tab or list of tabs in the pane
        const activeText = n.activeTabId ? `active: \`${n.activeTabId}\`` : ''
        const tabsText = n.tabs && n.tabs.length > 0 ? ` [${n.tabs.join(', ')}]` : ''
        panes.push(`\`${n.id}\`${tabsText} (${activeText})`)
      } else if (n.type === 'split') {
        splitsCount++
        traverse(n.first)
        traverse(n.second)
      }
    }
    traverse(layout)

    return `Right now, the workspace has **${panes.length} active panes** and **${splitsCount} splits**:\n${panes.map((p) => `- ${p}`).join('\n')}\n\nThe layout is currently **${locked ? 'LOCKED 🔒' : 'UNLOCKED 🔓'}**.`
  }

  // Initialize welcome message once layout loaded
  useEffect(() => {
    if (messages.length === 0 && layout) {
      const summary = getLayoutSummary()
      startWelcomeStream(INITIAL_MESSAGES(summary))
    }
  }, [layout])

  // Scroll to bottom on new messages or typing state change (internal scroll only)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, isTyping, streamedText])

  const handleSend = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      let replyText = ''
      const lowerText = text.toLowerCase()

      if (
        lowerText.includes('split') ||
        lowerText.includes('how to use') ||
        lowerText.includes('drag')
      ) {
        replyText = `To split a pane in **react-zeugma**:\n\n1. Click and hold any **tab header** (e.g. \`README.md\` or \`Terminal\`).\n2. Drag it towards the **edge** (top, bottom, left, or right) of the pane you want to split. You will see a dark blue highlight drop zone.\n3. Release the mouse button to complete the split.\n\n*Tip*: If you drop the tab in the center of the pane, it will join that pane as another tab instead of splitting!`
      } else if (
        lowerText.includes('layout') ||
        lowerText.includes('structure') ||
        lowerText.includes('pane')
      ) {
        replyText = `Here is an analysis of your current IDE layout:\n\n${getLayoutSummary()}\n\n*Note*: You can drag panes by their headers to reorganize them, or click the **Reset Layout** button at the bottom status bar if you want to start fresh.`
      } else if (
        lowerText.includes('lock') ||
        lowerText.includes('unlock') ||
        lowerText.includes('freeze')
      ) {
        replyText = `The layout is currently **${locked ? 'LOCKED' : 'UNLOCKED'}**.\n\nYou can toggle this state using the **${locked ? 'Unlock Layout' : 'Lock Layout'}** toggle in the status bar at the bottom-right.\n\nWhen the layout is locked, dragging tabs, splitting panes, and resizing are completely disabled, providing a stable, read-only UI layout state.`
      } else if (
        lowerText.includes('zeugma') ||
        lowerText.includes('what is') ||
        lowerText.includes('react-zeugma')
      ) {
        replyText = `**react-zeugma** is an extremely lightweight, high-performance window-docking layout manager for React.\n\nKey details:\n- 🧩 **100% Headless logic**: Styling is left entirely to you (we use Tailwind CSS in this demo).\n- 🚀 **High Performance**: Optimized with stable component rendering so only the resized/modified components update.\n- 💾 **State Serialization**: The entire layout is structured as a standard JSON tree, easily saved to databases or \`localStorage\`.`
      } else if (lowerText.includes('hello') || lowerText.includes('hi ') || lowerText === 'hi') {
        replyText = `Hello! How can I assist you with your Zeugma workspace layout today?`
      } else {
        replyText = `I understand you're asking about: *"${text}"*.\n\nI can help you with features specific to this IDE demo. Try asking:\n- *"Explain the current layout"* to see a breakdown of the active tree.\n- *"How do I split a pane?"* to learn drag-and-drop mechanics.\n- *"What is react-zeugma?"* to learn more about the library.\n- *"How to lock the layout?"* for locking details.`
      }

      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'copilot',
        text: replyText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
      streamMessage(botMsg)
    }, 1000)
  }

  const handleClear = () => {
    const summary = getLayoutSummary()
    startWelcomeStream(INITIAL_MESSAGES(summary))
  }

  // Helper to parse formatting (bold, inline code, blocks)
  const parseText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim()
        const lines = code.split('\n')
        const hasLang = lines[0].match(/^[a-zA-Z0-9]+$/)
        const lang = hasLang ? lines[0] : ''
        const codeText = hasLang ? lines.slice(1).join('\n') : code

        return (
          <div
            key={i}
            className="my-2 bg-[#2d2d2d] rounded border border-[#3e3e3f] overflow-hidden font-mono text-[10px] select-text"
          >
            {lang && (
              <div className="bg-[#252526] px-2.5 py-1 text-[8.5px] text-zinc-500 border-b border-[#3e3e3f] uppercase tracking-wider font-bold">
                {lang}
              </div>
            )}
            <pre className="p-2.5 overflow-x-auto text-[#abb2bf] scrollbar-thin">
              <code>{codeText}</code>
            </pre>
          </div>
        )
      }

      const inlineParts = part.split(/(`[^`\n]+`)/g)
      return (
        <span key={i} className="whitespace-pre-wrap leading-relaxed wrap-break-word">
          {inlineParts.map((subPart, j) => {
            if (subPart.startsWith('`') && subPart.endsWith('`')) {
              return (
                <code
                  key={j}
                  className="px-1 py-0.5 bg-[#2d2d2d] text-indigo-300 rounded font-mono text-[10px] border border-[#3c3c3d]"
                >
                  {subPart.slice(1, -1)}
                </code>
              )
            }

            const boldParts = subPart.split(/(\*\*[^*\n]+\*\*)/g)
            return boldParts.map((boldPart, k) => {
              if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                return (
                  <strong key={k} className="font-semibold text-white">
                    {boldPart.slice(2, -2)}
                  </strong>
                )
              }
              return boldPart
            })
          })}
        </span>
      )
    })
  }

  const suggestions = [
    { text: 'How do I split a pane?', icon: <Sparkles className="w-3 h-3 text-zinc-400" /> },
    { text: 'Explain the current layout', icon: <HelpCircle className="w-3 h-3 text-zinc-400" /> },
    { text: 'What is react-zeugma?', icon: <Code className="w-3 h-3 text-zinc-400" /> },
  ]

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] overflow-hidden text-xs text-zinc-300">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#2d2d30] px-4 py-2 bg-[#2d2d2d] text-[#858585] select-none shrink-0">
        <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] text-zinc-400">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>Zeugma Copilot</span>
        </div>
        <button
          onClick={handleClear}
          className="text-[#858585] hover:text-zinc-200 transition-colors p-0.5 rounded hover:bg-zinc-800"
          title="Clear Chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin select-text min-h-0"
        onClick={stopStreaming}
      >
        {messages.map((msg) => {
          const isCopilot = msg.sender === 'copilot'
          return (
            <div
              key={msg.id}
              className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                isCopilot ? 'items-start' : 'items-start flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                  isCopilot
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                {isCopilot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-[11px] leading-relaxed shadow-md ${
                  isCopilot
                    ? 'bg-[#252526] border border-[#2d2d30] text-zinc-300'
                    : 'bg-indigo-600/90 text-white'
                }`}
              >
                {parseText(msg.id === streamingMsgId ? streamedText : msg.text)}
                {msg.id === streamingMsgId && (
                  <span
                    className="inline-block w-[1.5px] h-[11px] bg-indigo-400 ml-0.5 align-middle"
                    style={{ animation: 'blink 0.8s step-end infinite' }}
                  />
                )}
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-[#252526] border border-[#2d2d30] rounded-lg px-3 py-2.5 flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-mono mr-0.5">Thinking</span>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                  style={{
                    animation: 'thinkingDot 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <style>{`
          @keyframes thinkingDot {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
            30% { transform: translateY(-4px); opacity: 1; }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      </div>

      {/* Suggested prompts / Input area */}
      <div className="border-t border-[#2d2d30] bg-[#1e1e1e] p-3 space-y-2.5 shrink-0 select-none">
        {/* Quick Suggestions */}
        {!isTyping && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold px-0.5">
              Suggested Questions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(sug.text)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#252526] border border-[#2d2d30] text-zinc-300 hover:text-white hover:bg-[#2d2d2d] hover:border-[#3e3e3f] transition-all text-[10.5px] cursor-pointer text-left font-medium active:scale-98"
                >
                  {sug.icon}
                  <span>{sug.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(inputValue)
          }}
          className="flex flex-col bg-[#252526] border border-[#2d2d30] rounded-md p-2 gap-1.5 focus-within:border-zinc-550 transition-colors"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              placeholder="Describe what to build"
              className="flex-1 bg-transparent border-none outline-none text-[11px] text-zinc-200 placeholder-zinc-500 font-mono disabled:opacity-50 py-1"
            />
          </div>

          <div className="flex items-center justify-between pt-1.5 mt-0.5 text-[9px] text-zinc-500">
            <div className="flex items-center gap-1.5 text-zinc-450">
              <button
                type="button"
                className="hover:text-zinc-300 p-0.5 rounded transition-colors cursor-pointer"
                title="Add Context"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-zinc-700 font-light">|</span>
              <button
                type="button"
                className="hover:text-zinc-300 p-0.5 rounded transition-colors cursor-pointer"
                title="Clear Context"
              >
                <CircleSlash className="w-3 h-3" />
              </button>
              <span className="text-zinc-700 font-light">|</span>

              <div className="flex items-center gap-1 hover:text-zinc-300 cursor-pointer transition-colors py-0.5 px-1 rounded hover:bg-zinc-800 font-mono">
                <span>Zeugma AI 3.5</span>
                <span className="text-[6px]">▼</span>
              </div>

              <span className="text-zinc-700 font-light">|</span>
              <button
                type="button"
                className="hover:text-zinc-300 p-0.5 rounded transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-5 h-5 flex items-center justify-center rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white disabled:bg-zinc-900 disabled:text-zinc-700 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
