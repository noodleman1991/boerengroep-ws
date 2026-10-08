import type { Field } from 'payload'

/**
 * A short "how to" at the top of a screen: a title and numbered steps. It stores nothing.
 * `name` only has to be unique among its neighbours.
 */
export function helpSteps(title: string, steps: string[], name = 'howTo'): Field {
  return {
    name,
    type: 'ui',
    admin: { components: { Field: { path: '@/components/admin/help-steps#HelpSteps', clientProps: { title, steps } } } },
  }
}
