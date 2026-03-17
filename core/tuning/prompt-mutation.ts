export type MutationTechnique =
  | 'instruction_rewrite'
  | 'example_injection'
  | 'context_reduction'
  | 'format_enforcement'
  | 'chain_of_thought'

const MUTATION_TEMPLATES: Record<MutationTechnique, (prompt: string, context?: string) => string> = {
  instruction_rewrite: (prompt) =>
    `You are an expert assistant. ${prompt.replace(/^you are/i, 'As an expert,').replace(/please/gi, '').trim()} Be precise and concise.`,
  example_injection: (prompt, context) =>
    `${prompt}\n\nExample:\nInput: ${context ?? 'sample input'}\nOutput: [expected output based on the above]\n\nNow apply the same pattern:`,
  context_reduction: (prompt) =>
    prompt
      .split(/\.\s+/)
      .filter((s, i) => i < 3 || s.length > 20)
      .join('. ')
      .trim(),
  format_enforcement: (prompt) =>
    `${prompt}\n\nIMPORTANT: Respond ONLY in the requested format. Do not include explanations unless asked.`,
  chain_of_thought: (prompt) =>
    `${prompt}\n\nThink step by step:\n1. First, understand what is being asked.\n2. Break down the problem.\n3. Reason through each part.\n4. Provide the final answer.`,
}

export function mutatePrompt(original: string, technique: MutationTechnique, context?: string): string {
  const mutate = MUTATION_TEMPLATES[technique]
  return mutate(original, context)
}

export function generateVariants(prompt: string, count: number, context?: string): Array<{ technique: MutationTechnique; prompt: string }> {
  const techniques = Object.keys(MUTATION_TEMPLATES) as MutationTechnique[]
  const variants: Array<{ technique: MutationTechnique; prompt: string }> = []
  for (let i = 0; i < Math.min(count, techniques.length); i++) {
    const technique = techniques[i % techniques.length]
    variants.push({ technique, prompt: mutatePrompt(prompt, technique, context) })
  }
  return variants
}
