export interface MemoryEntry {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: string
  tool_name?: string
}

export class AgentMemory {
  private entries: MemoryEntry[] = []

  add(entry: Omit<MemoryEntry, 'timestamp'>): void {
    this.entries.push({ ...entry, timestamp: new Date().toISOString() })
  }

  getHistory(): MemoryEntry[] {
    return [...this.entries]
  }

  getRecent(n: number): MemoryEntry[] {
    return this.entries.slice(-n)
  }

  clear(): void {
    this.entries = []
  }

  toMessages(): Array<{ role: string; content: string }> {
    return this.entries.map(e => ({
      role: e.role === 'tool' ? 'user' : e.role,
      content: e.tool_name ? `[Tool: ${e.tool_name}] ${e.content}` : e.content,
    }))
  }
}
