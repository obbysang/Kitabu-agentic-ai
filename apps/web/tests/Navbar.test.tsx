import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navbar from '../components/Navbar'

vi.mock('connectkit', () => ({
  ConnectKitButton: {
    Custom: ({ children }: any) =>
      typeof children === 'function'
        ? children({ isConnected: false, show: vi.fn(), truncatedAddress: '0x1234', ensName: null })
        : children
  }
}))

describe('Navbar', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders navigation with accessible label', () => {
    render(<Navbar currentPage="home" />)
    const nav = screen.getByRole('navigation', { name: /primary/i })
    expect(nav).toBeDefined()
  })

  it('toggles mobile menu and sets aria-expanded', async () => {
    render(<Navbar currentPage="home" />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    const overlay = screen.getByLabelText(/mobile menu/i)
    expect(overlay).toBeDefined()
  })

  it('closes mobile menu on Escape', async () => {
    render(<Navbar currentPage="home" />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    await userEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    await userEvent.keyboard('{Escape}')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('focuses first mobile item when opened', async () => {
    render(<Navbar currentPage="home" />)
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    await userEvent.click(toggle)
    const firstItem = screen.getByRole('button', { name: /dashboard/i })
    expect(document.activeElement).toBe(firstItem)
  })

  it('shows loading placeholders', () => {
    render(<Navbar currentPage="home" loading />)
    expect(screen.queryByRole('menubar')).toBeNull()
  })

  it('shows error alert', () => {
    render(<Navbar currentPage="home" error="Network error" />)
    const alert = screen.getByRole('alert')
    expect(alert.textContent || '').toMatch(/network error/i)
  })

  it('marks active section with aria-current', () => {
    render(<Navbar currentPage="dashboard" />)
    const active = screen.getByRole('menuitem', { name: /dashboard/i })
    expect(active.getAttribute('aria-current')).toBe('page')
  })

  it('provides docs link', () => {
    render(<Navbar currentPage="home" docsHref="https://example.com/docs" />)
    const link = screen.getByRole('link', { name: /open documentation/i })
    expect(link.getAttribute('href')).toBe('https://example.com/docs')
  })
})
