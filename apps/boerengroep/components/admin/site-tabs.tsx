'use client'

import { useTenantSelection } from '@payloadcms/plugin-multi-tenant/client'
import { useEffect } from 'react'

const name = (label: unknown): string =>
  typeof label === 'string' ? label : label && typeof label === 'object' ? String(Object.values(label)[0] ?? '') : ''

/**
 * One admin panel serves both sites. People who work on both see the sites as tabs at the top
 * of the menu and on the welcome screen, so it is always clear which site they are changing.
 * People with one site see nothing. The tabs stand in the order of the list of websites.
 */
export function SiteTabs({ variant = 'menu' }: { variant?: 'menu' | 'welcome' }) {
  const { options, selectedTenantID, setTenant, entityType } = useTenantSelection()
  // Switching while an item is open would move that item to the other site.
  const editing = entityType === 'document'
  const first = options[0]?.value

  // Nobody means to work on two websites at once. Until someone chooses, the first one is
  // chosen for them, so every list shows one website and says which.
  useEffect(() => {
    if (variant === 'menu' && !editing && options.length > 1 && selectedTenantID === undefined && first !== undefined) {
      setTenant({ id: first, refresh: true })
    }
  }, [variant, editing, options.length, selectedTenantID, first, setTenant])

  if (options.length < 2) return null

  return (
    <div className={`site-tabs site-tabs--${variant}`}>
      <p className="site-tabs__label" id={`site-tabs-label-${variant}`}>
        You are working on
      </p>
      <div className="site-tabs__row" role="group" aria-labelledby={`site-tabs-label-${variant}`}>
        {options.map((option) => {
          const selected = String(option.value) === String(selectedTenantID)
          return (
            <button
              key={String(option.value)}
              type="button"
              className="site-tabs__tab"
              aria-pressed={selected}
              disabled={editing && !selected}
              onClick={() => {
                if (!selected) setTenant({ id: option.value, refresh: true })
              }}
            >
              {name(option.label)}
            </button>
          )
        })}
      </div>
      {editing && <p className="site-tabs__hint">Close this item to switch to the other site.</p>}
      {!editing && selectedTenantID !== undefined && variant === 'welcome' && (
        <p className="site-tabs__hint">Everything below belongs to this website. Click the other name to switch.</p>
      )}
    </div>
  )
}
