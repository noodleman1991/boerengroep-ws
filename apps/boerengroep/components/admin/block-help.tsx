'use client'

/** One line at the top of a block that says what the block is for. */
export function BlockHelp({ text }: { text?: string }) {
  return text ? <p className="block-help">{text}</p> : null
}
