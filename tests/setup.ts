import { vi } from 'vitest'

// Register manual mocks for external services so that any test importing code
// which depends on these packages gets the stub implementations from __mocks__/
vi.mock('@supabase/ssr')
vi.mock('@supabase/supabase-js')
vi.mock('stripe')
vi.mock('openai')
vi.mock('@upstash/ratelimit')
