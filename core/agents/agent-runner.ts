import { buildDefaultGraph, executeGraph, type AgentGraph, type AgentContext } from './agent-graph'
import { AgentMemory } from './agent-memory'

export interface Agent {
  id: string
  name: string
  description: string
  tools: string[]
  prompts: string[]
  workflow_graph?: AgentGraph
}

export interface AgentStep {
  node_id: string
  output: string
}

export interface AgentRunResult {
  agent_id: string
  input: string
  output: string
  steps: AgentStep[]
  tokens_used: number
  latency_ms: number
}

export async function runAgent(agent: Agent, input: string, context?: Partial<AgentContext>): Promise<AgentRunResult> {
  const start = Date.now()
  const memory = new AgentMemory()
  memory.add({ role: 'user', content: input })

  const graph = agent.workflow_graph ?? buildDefaultGraph()
  const agentContext: AgentContext = {
    ...context,
    tools: agent.tools,
    memory,
  }

  const { output, steps } = await executeGraph(graph, input, agentContext)
  memory.add({ role: 'assistant', content: output })

  const latency_ms = Date.now() - start
  const tokens_used = Math.floor((input.length + output.length) / 4) // rough estimate

  return {
    agent_id: agent.id,
    input,
    output,
    steps,
    tokens_used,
    latency_ms,
  }
}
