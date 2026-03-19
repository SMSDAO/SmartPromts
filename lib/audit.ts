/**
 * Audit logging module
 *
 * Logs privileged actions to the `audit_logs` Supabase table.
 * Only admin and developer actions need to be tracked.
 */

import { createAdminClient } from './supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuditAction =
  // User management
  | 'user.role_changed'
  | 'user.banned'
  | 'user.unbanned'
  | 'user.usage_reset'
  // Dataset operations
  | 'dataset.created'
  | 'dataset.updated'
  | 'dataset.deleted'
  // Prompt operations
  | 'prompt.created'
  | 'prompt.updated'
  | 'prompt.deleted'
  | 'prompt.published'
  // Billing events
  | 'billing.subscription_changed'
  | 'billing.invoice_paid'
  | 'billing.refund_issued'
  // System events
  | 'system.model_config_changed'
  | 'system.agent_deployed'
  | 'system.experiment_started'
  | 'system.experiment_stopped'

export interface AuditEvent {
  /** ID of the user performing the action */
  actor_id: string
  /** Action performed */
  action: AuditAction
  /** Type of resource affected */
  resource_type: string
  /** ID of the affected resource (if applicable) */
  resource_id?: string
  /** Additional structured metadata */
  metadata?: Record<string, unknown>
}

export interface AuditLog extends AuditEvent {
  id: string
  created_at: string
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Persist an audit event to the `audit_logs` collection.
 *
 * Failures are non-fatal – they are logged to stderr but never thrown to
 * avoid blocking the primary business operation.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('audit_logs').insert({
      actor_id: event.actor_id,
      action: event.action,
      resource_type: event.resource_type,
      resource_id: event.resource_id ?? null,
      metadata: event.metadata ?? {},
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error('[audit] Failed to write audit log:', error.message)
    }
  } catch (err) {
    console.error('[audit] Unexpected error writing audit log:', err)
  }
}

/**
 * Retrieve paginated audit logs (admin only – caller must enforce RBAC).
 *
 * @param limit  - Maximum number of records to return (default 50)
 * @param before - ISO timestamp cursor for pagination
 */
export async function getAuditLogs(
  limit = 50,
  before?: string,
): Promise<AuditLog[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (before) {
    query = query.lt('created_at', before)
  }

  const { data, error } = await query

  if (error) {
    console.error('[audit] Failed to read audit logs:', error.message)
    return []
  }

  return (data ?? []) as AuditLog[]
}
