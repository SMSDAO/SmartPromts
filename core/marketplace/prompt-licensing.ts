export type LicenseType = 'personal' | 'commercial' | 'enterprise' | 'open_source'

export const LICENSES: Record<LicenseType, { name: string; description: string; allows_commercial: boolean; requires_attribution: boolean }> = {
  personal: {
    name: 'Personal Use',
    description: 'May only be used for non-commercial personal projects.',
    allows_commercial: false,
    requires_attribution: false,
  },
  commercial: {
    name: 'Commercial License',
    description: 'May be used in commercial products and services.',
    allows_commercial: true,
    requires_attribution: false,
  },
  enterprise: {
    name: 'Enterprise License',
    description: 'Unlimited commercial use across the organisation.',
    allows_commercial: true,
    requires_attribution: false,
  },
  open_source: {
    name: 'Open Source (MIT-like)',
    description: 'Free to use in any project with attribution.',
    allows_commercial: true,
    requires_attribution: true,
  },
}

export interface License {
  id: string
  prompt_id: string
  buyer_id: string
  type: LicenseType
  issued_at: string
  expires_at?: string
}

export function generateLicense(promptId: string, buyerId: string, type: LicenseType): License {
  return {
    id: `lic_${Math.random().toString(36).substring(2, 11)}`,
    prompt_id: promptId,
    buyer_id: buyerId,
    type,
    issued_at: new Date().toISOString(),
  }
}

export function validateLicense(license: License): { valid: boolean; reason?: string } {
  if (!license.id || !license.prompt_id || !license.buyer_id) {
    return { valid: false, reason: 'Missing required license fields' }
  }
  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    return { valid: false, reason: 'License has expired' }
  }
  return { valid: true }
}
