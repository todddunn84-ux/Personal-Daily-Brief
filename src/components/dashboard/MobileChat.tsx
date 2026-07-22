'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Zap, X } from 'lucide-react'
import { AiChatPanel } from './AiChatPanel'

// On < lg screens the chat sidebar is hidden; this floating button opens the
// assistant as a bottom sheet instead.
export function MobileChat() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label="Open AI assistant"
          className="lg:hidden fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-brand-500 hover:bg-brand-600 shadow-xl flex items-center justify-center transition-colors cursor-pointer"
        >
          <Zap className="w-6 h-6 text-accent-light" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-brand-700/40 backdrop-blur-[2px] z-40 lg:hidden" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-14 z-50 lg:hidden focus:outline-none">
          <Dialog.Title className="sr-only">AI Assistant</Dialog.Title>
          <div className="relative h-full rounded-t-2xl overflow-hidden bg-surface-900 shadow-2xl">
            <Dialog.Close asChild>
              <button
                aria-label="Close AI assistant"
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
            <AiChatPanel />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
