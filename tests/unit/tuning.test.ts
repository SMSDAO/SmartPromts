import { describe, it, expect } from 'vitest'
import { rankScore, rankVariants, type ScoredVariant } from '../../core/tuning/prompt-ranking'
import { mutatePrompt, generateVariants, type MutationTechnique } from '../../core/tuning/prompt-mutation'

describe('rankScore', () => {
  it('computes total as weighted sum', () => {
    const result = rankScore(1, 1, 1, 1)
    expect(result.total).toBeCloseTo(1.0)
  })

  it('weights accuracy at 0.5', () => {
    const r1 = rankScore(1, 0, 0, 0)
    expect(r1.total).toBeCloseTo(0.5)
  })

  it('weights format at 0.2', () => {
    const r = rankScore(0, 1, 0, 0)
    expect(r.total).toBeCloseTo(0.2)
  })

  it('weights cost at 0.2', () => {
    const r = rankScore(0, 0, 1, 0)
    expect(r.total).toBeCloseTo(0.2)
  })

  it('weights latency at 0.1', () => {
    const r = rankScore(0, 0, 0, 1)
    expect(r.total).toBeCloseTo(0.1)
  })
})

describe('rankVariants', () => {
  it('sorts variants by total score descending', () => {
    const variants: ScoredVariant[] = [
      { id: 'a', prompt: 'a', technique: 'original', score: rankScore(0.5, 0.5, 0.5, 0.5) },
      { id: 'b', prompt: 'b', technique: 'chain_of_thought', score: rankScore(0.9, 0.9, 0.9, 0.9) },
      { id: 'c', prompt: 'c', technique: 'format_enforcement', score: rankScore(0.1, 0.1, 0.1, 0.1) },
    ]
    const ranked = rankVariants(variants)
    expect(ranked[0].id).toBe('b')
    expect(ranked[2].id).toBe('c')
  })

  it('does not mutate original array', () => {
    const variants: ScoredVariant[] = [
      { id: 'x', prompt: 'x', technique: 'original', score: rankScore(0.3, 0.3, 0.3, 0.3) },
      { id: 'y', prompt: 'y', technique: 'chain_of_thought', score: rankScore(0.9, 0.9, 0.9, 0.9) },
    ]
    const original = [...variants]
    rankVariants(variants)
    expect(variants[0].id).toBe(original[0].id)
  })
})

describe('mutatePrompt', () => {
  const base = 'You are a helpful assistant. Please answer the question.'

  it('instruction_rewrite produces different text', () => {
    const mutated = mutatePrompt(base, 'instruction_rewrite')
    expect(mutated).not.toBe(base)
    expect(mutated.length).toBeGreaterThan(0)
  })

  it('chain_of_thought adds step-by-step instructions', () => {
    const mutated = mutatePrompt(base, 'chain_of_thought')
    expect(mutated).toContain('step')
  })

  it('format_enforcement adds format constraint', () => {
    const mutated = mutatePrompt(base, 'format_enforcement')
    expect(mutated.toLowerCase()).toContain('format')
  })

  it('example_injection includes example', () => {
    const mutated = mutatePrompt(base, 'example_injection', 'some context')
    expect(mutated.toLowerCase()).toContain('example')
  })

  it('all 5 techniques produce non-empty results', () => {
    const techniques: MutationTechnique[] = [
      'instruction_rewrite',
      'example_injection',
      'context_reduction',
      'format_enforcement',
      'chain_of_thought',
    ]
    for (const t of techniques) {
      const result = mutatePrompt(base, t)
      expect(result.length).toBeGreaterThan(0)
    }
  })
})

describe('generateVariants', () => {
  it('generates up to count variants', () => {
    const variants = generateVariants('Hello world', 3)
    expect(variants.length).toBe(3)
  })

  it('each variant has a technique and prompt', () => {
    const variants = generateVariants('Test prompt', 2)
    for (const v of variants) {
      expect(v.technique).toBeTruthy()
      expect(v.prompt).toBeTruthy()
    }
  })

  it('caps at number of available techniques (5)', () => {
    const variants = generateVariants('Test', 100)
    expect(variants.length).toBeLessThanOrEqual(5)
  })
})
