import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AppRouter } from '@/app/AppRouter'
import { AppContext, defaultState } from '@/hooks/useAppStore'

function renderRoute(path: string) {
  return render(
    <AppContext.Provider value={{ state: defaultState, setState: () => {} }}>
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>
    </AppContext.Provider>
  )
}

describe('app route smoke tests', () => {
  it('renders event list and event detail routes', () => {
    renderRoute('/events')
    expect(screen.getByRole('heading', { name: 'Events' })).toBeInTheDocument()
    expect(screen.getByText('Open for Registration')).toBeInTheDocument()

    renderRoute('/events/e6')
    expect(screen.getByRole('heading', { name: 'Global GT3 Showdown - Silverstone' })).toBeInTheDocument()
  })

  it('renders championship query route and selected schedule event', () => {
    renderRoute('/championships/ch1?tab=schedule&event=e14')

    expect(screen.getByRole('button', { name: 'Schedule' })).toBeInTheDocument()
    expect(screen.getByText('MOZA GT3 Challenge - Dubai')).toBeInTheDocument()
  })

  it('renders calendar and team routes', () => {
    renderRoute('/calendar')
    expect(screen.getByRole('heading', { name: 'Event Calendar' })).toBeInTheDocument()

    renderRoute('/team/t1')
    expect(screen.getByRole('heading', { name: 'Dragon Racing' })).toBeInTheDocument()
  })
})
