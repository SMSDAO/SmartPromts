import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { runAgent, type Agent } from '@/core/agents/agent-runner'
import { z } from 'zod'

const AgentRunSchema = z.object({
  agent_id: z.string().optional(),
  agent_config: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    tools: z.array(z.string()).optional(),
    prompts: z.array(z.string()).optional(),
  }).optional(),
  input: z.string().min(1).max(10000),
  context: z.record(z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = AgentRunSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request', details: parsed.error.errors }, { status: 400 })

    const { agent_id, agent_config, input, context } = parsed.data

    const agent: Agent = {
      id: agent_id ?? agent_config?.id ?? 'default',
      name: agent_config?.name ?? 'Default Agent',
      description: agent_config?.description ?? 'A general-purpose AI agent',
      tools: agent_config?.tools ?? ['webSearch', 'dbQuery', 'codeInterpreter'],
      prompts: agent_config?.prompts ?? [],
    }

    const result = await runAgent(agent, input, { user_id: session.user.id, metadata: context })
    return NextResponse.json({ result })
  } catch (error) {
    console.error('POST /api/agents/run error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
