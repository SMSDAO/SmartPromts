import { vi } from 'vitest'

const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
        status: 'open',
      }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'cs_test_123',
        status: 'complete',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
      }),
    },
  },
  webhooks: {
    constructEvent: vi.fn().mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_123', customer: 'cus_test_123' } },
    }),
  },
  customers: {
    create: vi.fn().mockResolvedValue({ id: 'cus_test_123' }),
    retrieve: vi.fn().mockResolvedValue({ id: 'cus_test_123', email: 'test@example.com' }),
  },
  subscriptions: {
    retrieve: vi.fn().mockResolvedValue({ id: 'sub_test_123', status: 'active' }),
    cancel: vi.fn().mockResolvedValue({ id: 'sub_test_123', status: 'canceled' }),
  },
}

export default vi.fn(() => mockStripe)
