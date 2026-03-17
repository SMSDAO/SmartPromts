import type { PromptVariant } from './tuning-runner'

export function selectParents(variants: PromptVariant[], n: number): PromptVariant[] {
  return [...variants].sort((a, b) => b.score - a.score).slice(0, n)
}

export function crossover(a: PromptVariant, b: PromptVariant): PromptVariant {
  const sentencesA = a.prompt.split(/\.\s+/)
  const sentencesB = b.prompt.split(/\.\s+/)
  const mid = Math.floor(Math.min(sentencesA.length, sentencesB.length) / 2)
  const combined = [...sentencesA.slice(0, mid), ...sentencesB.slice(mid)].join('. ').trim()
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, '').substring(0, 9)
    : Math.random().toString(36).substring(2, 11)
  return {
    id,
    prompt: combined || a.prompt,
    score: (a.score + b.score) / 2,
    technique: 'crossover',
  }
}

export function evolve(variants: PromptVariant[], iterations: number): PromptVariant[] {
  let population = [...variants]
  for (let i = 0; i < iterations; i++) {
    const parents = selectParents(population, Math.max(2, Math.floor(population.length / 2)))
    const children: PromptVariant[] = []
    for (let j = 0; j < parents.length - 1; j++) {
      children.push(crossover(parents[j], parents[j + 1]))
    }
    population = [...population, ...children].sort((a, b) => b.score - a.score).slice(0, 10)
  }
  return population
}
