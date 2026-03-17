export interface AgentContext {
  user_id?: string
  session_id?: string
  tools?: string[]
  memory?: import('./agent-memory').AgentMemory
  metadata?: Record<string, unknown>
}

export interface AgentNode {
  id: string
  name: string
  type: 'input' | 'classifier' | 'tool_selector' | 'llm' | 'post_processor' | 'output'
  execute: (input: string, context: AgentContext) => Promise<string>
}

export interface AgentGraph {
  nodes: AgentNode[]
  edges: Array<{ from: string; to: string }>
}

import { getTool } from './tool-registry'
import OpenAI from 'openai'

export function buildDefaultGraph(): AgentGraph {
  const nodes: AgentNode[] = [
    {
      id: 'input',
      name: 'Input Handler',
      type: 'input',
      execute: async (input) => input,
    },
    {
      id: 'classifier',
      name: 'Intent Classifier',
      type: 'classifier',
      execute: async (input) => {
        const lower = input.toLowerCase()
        if (lower.includes('search') || lower.includes('find')) return `[intent:search] ${input}`
        if (lower.includes('code') || lower.includes('run')) return `[intent:code] ${input}`
        if (lower.includes('file') || lower.includes('read')) return `[intent:file] ${input}`
        return `[intent:general] ${input}`
      },
    },
    {
      id: 'tool_selector',
      name: 'Tool Selector',
      type: 'tool_selector',
      execute: async (input, context) => {
        const intentMatch = input.match(/\[intent:(\w+)\]/)
        const intent = intentMatch?.[1] ?? 'general'
        const toolMap: Record<string, string> = {
          search: 'webSearch',
          code: 'codeInterpreter',
          file: 'fileReader',
          general: 'dbQuery',
        }
        const toolName = toolMap[intent] ?? 'dbQuery'
        const isAllowed = !context.tools || context.tools.includes(toolName)
        if (!isAllowed) {
          return input
        }
        const tool = getTool(toolName)
        if (tool) {
          const result = await tool.execute(input.replace(/\[intent:\w+\]\s*/, ''))
          return `[tool:${toolName}] ${result}`
        }
        return input
      },
    },
    {
      id: 'llm',
      name: 'LLM Processor',
      type: 'llm',
      execute: async (input) => {
        const openai = process.env.OPENAI_API_KEY
          ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
          : null
        if (!openai) return `[LLM response for: ${input.slice(0, 100)}...]`
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: input }],
          max_tokens: 500,
        })
        return completion.choices[0]?.message?.content ?? input
      },
    },
    {
      id: 'post_processor',
      name: 'Post Processor',
      type: 'post_processor',
      execute: async (input) => input.replace(/\[tool:\w+\]\s*/g, '').trim(),
    },
    {
      id: 'output',
      name: 'Output Handler',
      type: 'output',
      execute: async (input) => input,
    },
  ]

  const edges = [
    { from: 'input', to: 'classifier' },
    { from: 'classifier', to: 'tool_selector' },
    { from: 'tool_selector', to: 'llm' },
    { from: 'llm', to: 'post_processor' },
    { from: 'post_processor', to: 'output' },
  ]

  return { nodes, edges }
}

export async function executeGraph(graph: AgentGraph, input: string, context: AgentContext): Promise<{ output: string; steps: Array<{ node_id: string; output: string }> }> {
  const nodeMap = new Map(graph.nodes.map(n => [n.id, n]))
  const steps: Array<{ node_id: string; output: string }> = []

  // Simple linear execution following edges
  let currentNodeId = graph.nodes[0]?.id
  let currentOutput = input

  const visited = new Set<string>()

  while (currentNodeId && !visited.has(currentNodeId)) {
    visited.add(currentNodeId)
    const node = nodeMap.get(currentNodeId)
    if (!node) break

    currentOutput = await node.execute(currentOutput, context)
    steps.push({ node_id: currentNodeId, output: currentOutput })

    const nextEdge = graph.edges.find(e => e.from === currentNodeId)
    currentNodeId = nextEdge?.to ?? ''
  }

  return { output: currentOutput, steps }
}
