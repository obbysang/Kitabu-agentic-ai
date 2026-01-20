import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Rails from '../pages/Rails'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('Rails page integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('creates session and executes batch intent', async () => {
    const session = {
      sessionId: 's-123',
      status: 'created',
      config: { orgId: 'org-1', userId: 'user-1', expiresAt: Date.now() + 60 * 60 * 1000, permissions: [] },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    const intent = {
      id: 'intent-1',
      sessionId: 's-123',
      type: 'payment',
      payload: {},
      status: 'created',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => session })
      .mockResolvedValueOnce({ ok: true, json: async () => intent })
    )

    const qc = new QueryClient()
    render(
      <QueryClientProvider client={qc}>
        <Rails />
      </QueryClientProvider>
    )

    const addBtn = screen.getByText('+ Add Recipient')
    fireEvent.click(addBtn)

    const addressInput = screen.getByPlaceholderText('0x...')
    const amountInput = screen.getByPlaceholderText('0')
    fireEvent.change(addressInput, { target: { value: '0xabc123' } })
    fireEvent.change(amountInput, { target: { value: '500' } })

    const signBtn = screen.getByText(/Sign Session/i)
    fireEvent.click(signBtn)

    await waitFor(() => expect(screen.getByText(/ACTIVE/i)).toBeTruthy())

    const executeBtn = screen.getByText(/Execute Batch/i)
    fireEvent.click(executeBtn)

    await waitFor(() => expect(screen.getByText(/Intent intent-1 created/i)).toBeTruthy())
  })
})
