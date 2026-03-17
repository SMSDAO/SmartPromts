export const CREATOR_SHARE = 0.8
export const PLATFORM_FEE = 0.2

export function calculatePayout(price: number, downloads: number): { creator: number; platform: number; total: number } {
  const total = price * downloads
  return {
    creator: total * CREATOR_SHARE,
    platform: total * PLATFORM_FEE,
    total,
  }
}

export function validatePrice(price: number): { valid: boolean; error?: string } {
  if (price < 0) return { valid: false, error: 'Price cannot be negative' }
  if (price > 10000) return { valid: false, error: 'Price cannot exceed $10,000' }
  return { valid: true }
}

export function getPricingTiers(): Array<{ name: string; price: number; description: string }> {
  return [
    { name: 'Free', price: 0, description: 'Community prompts available to everyone' },
    { name: 'Basic', price: 4.99, description: 'Entry-level professional prompts' },
    { name: 'Standard', price: 9.99, description: 'High-quality verified prompts' },
    { name: 'Premium', price: 29.99, description: 'Expert-crafted, fully documented prompts' },
    { name: 'Enterprise', price: 99.99, description: 'Custom enterprise-grade prompt solutions' },
  ]
}
