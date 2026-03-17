export interface Tool {
  name: string
  description: string
  execute: (input: string, context?: Record<string, unknown>) => Promise<string>
}

const toolRegistry = new Map<string, Tool>()

const builtinTools: Tool[] = [
  {
    name: 'webSearch',
    description: 'Search the web for information',
    execute: async (input) => `[Web search results for: ${input}] - No live search in this environment.`,
  },
  {
    name: 'dbQuery',
    description: 'Query the database for structured data',
    execute: async (input) => `[DB query: ${input}] - Returns structured data from the database.`,
  },
  {
    name: 'codeInterpreter',
    description: 'Execute code snippets and return results',
    execute: async (input) => {
      try {
        const fn = new Function(`"use strict"; return (${input})`)
        const result = fn()
        return String(result)
      } catch (e) {
        return `Error executing code: ${e instanceof Error ? e.message : String(e)}`
      }
    },
  },
  {
    name: 'fileReader',
    description: 'Read file contents',
    execute: async (input) => `[File reader: ${input}] - File reading requires server-side access.`,
  },
  {
    name: 'apiConnector',
    description: 'Connect to external APIs',
    execute: async (input, context) => {
      const url = context?.url as string ?? input
      try {
        const res = await fetch(url)
        const text = await res.text()
        return text.slice(0, 500)
      } catch (e) {
        return `API call failed: ${e instanceof Error ? e.message : String(e)}`
      }
    },
  },
]

builtinTools.forEach(t => toolRegistry.set(t.name, t))

export function registerTool(tool: Tool): void {
  toolRegistry.set(tool.name, tool)
}

export function getTool(name: string): Tool | undefined {
  return toolRegistry.get(name)
}

export function listTools(): Tool[] {
  return Array.from(toolRegistry.values())
}
