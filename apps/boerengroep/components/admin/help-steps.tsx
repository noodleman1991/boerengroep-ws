'use client'

/** A short "how to" at the top of a screen: a title and numbered steps. */
export function HelpSteps({ title, steps = [] }: { title?: string; steps?: string[] }) {
  if (steps.length === 0) return null
  return (
    <section className="help-steps" aria-label={title}>
      {title && <h3 className="help-steps__title">{title}</h3>}
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  )
}
