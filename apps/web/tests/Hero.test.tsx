import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Hero from '../components/Hero'

describe('Hero', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('renders correctly', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { name: /AI CFO/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Launch Command Dashboard/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /View x402 Documentation/i })).toBeDefined()
  })

  it('calls onNavigate when launch dashboard button is clicked', async () => {
    const onNavigate = vi.fn()
    render(<Hero onNavigate={onNavigate} />)
    const button = screen.getByRole('button', { name: /Launch Command Dashboard/i })
    await userEvent.click(button)
    expect(onNavigate).toHaveBeenCalledWith('dashboard')
  })

  it('opens docs in new tab when docs button is clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    render(<Hero />)
    const button = screen.getByRole('button', { name: /View x402 Documentation/i })
    await userEvent.click(button)
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('docs.cronos.org'),
      '_blank',
      'noopener,noreferrer'
    )
  })
})
