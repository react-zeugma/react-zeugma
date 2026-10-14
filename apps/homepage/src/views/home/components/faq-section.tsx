'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { FAQ_ITEMS } from '@/config/seo'

export function FaqSection() {
  const [openIndices, setOpenIndices] = useState<number[]>([0])

  const toggle = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    )
  }

  return (
    <section
      id="faq"
      className="py-24 px-6 sm:px-8 border-b border-border-primary bg-bg-sidebar/30 relative"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow mb-2 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            <span>Knowledge Base &amp; Search FAQ</span>
          </div>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-text-secondary text-sm mt-3 leading-relaxed">
            Everything you need to know about choosing react-zeugma over traditional coordinate
            grids and legacy tiling managers.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndices.includes(idx)
            return (
              <div
                key={item.question}
                className="rounded-2xl border border-border-primary bg-bg-pane shadow-2xs overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full py-5 px-6 flex items-center justify-between gap-4 text-left font-bold text-text-primary text-sm sm:text-base hover:text-accent transition-colors cursor-pointer select-none"
                >
                  <span>{item.question}</span>
                  <div
                    className={`w-6 h-6 rounded-full bg-bg-sidebar/80 border border-border-primary flex items-center justify-center text-text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-accent border-accent/40 bg-accent/5' : ''
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border-primary/40 pt-4">
                    {item.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
