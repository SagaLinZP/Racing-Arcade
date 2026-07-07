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
  it('renders events list route', () => {
    renderRoute('/events')
    expect(screen.getByRole('heading', { name: 'Events' })).toBeInTheDocument()
  })

  it('renders round detail route', () => {
    renderRoute('/events/c1/rounds/c1r1')
    expect(screen.getByText(/Stages|赛程阶段/)).toBeInTheDocument()
  })

  it('renders competition detail route for multi-round', () => {
    renderRoute('/events/c1')
    expect(screen.getByText('MOZA GT3 Challenge 2026')).toBeInTheDocument()
  })

  it('renders calendar and team routes', () => {
    renderRoute('/calendar')
    expect(screen.getByRole('heading', { name: 'Event Calendar' })).toBeInTheDocument()

    renderRoute('/team/t1')
    expect(screen.getByRole('heading', { name: 'Dragon Racing' })).toBeInTheDocument()
  })
})
