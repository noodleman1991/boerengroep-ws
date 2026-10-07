import type { Block } from 'payload'
import { actionsField } from '../fields/shared'

export const Cta: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  fields: [{ name: 'title', type: 'text' }, { name: 'description', type: 'textarea' }, actionsField],
}
