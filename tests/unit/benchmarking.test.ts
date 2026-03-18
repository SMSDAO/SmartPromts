import { describe, it, expect } from 'vitest'
import {
  calculateAccuracy,
  calculateSemanticSimilarity,
  calculateGroundednessScore,
  calculateBenchmarkScore,
} from '../../core/benchmarking/benchmark-metrics'

describe('calculateAccuracy', () => {
  it('returns 1 for identical strings', () => {
    expect(calculateAccuracy('hello world', 'hello world')).toBe(1)
  })

  it('returns 0 for empty expected', () => {
    expect(calculateAccuracy('', 'hello')).toBe(0)
  })

  it('returns 0 for empty actual', () => {
    expect(calculateAccuracy('hello', '')).toBe(0)
  })

  it('returns partial score for partial overlap', () => {
    const score = calculateAccuracy('machine learning is AI', 'machine learning')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('is case-insensitive', () => {
    expect(calculateAccuracy('Hello World', 'hello world')).toBe(1)
  })
})

describe('calculateSemanticSimilarity', () => {
  it('returns 1 for identical strings', () => {
    expect(calculateSemanticSimilarity('the quick brown fox', 'the quick brown fox')).toBe(1)
  })

  it('returns 0 for completely different strings', () => {
    expect(calculateSemanticSimilarity('abc def', 'xyz uvw')).toBe(0)
  })

  it('returns partial score for overlapping words', () => {
    const score = calculateSemanticSimilarity('cat sat mat', 'cat hat bat')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('handles empty strings', () => {
    expect(calculateSemanticSimilarity('', '')).toBe(0)
    expect(calculateSemanticSimilarity('hello', '')).toBe(0)
  })
})

describe('calculateGroundednessScore', () => {
  it('returns 1 when actual matches expected exactly', () => {
    expect(calculateGroundednessScore('cat dog', 'cat dog')).toBe(1)
  })

  it('returns 0 for completely hallucinated content', () => {
    const score = calculateGroundednessScore('cat dog', 'elephant tiger')
    expect(score).toBe(0)
  })

  it('returns partial score for partially hallucinated content', () => {
    const score = calculateGroundednessScore('cat dog', 'cat elephant')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })

  it('is stable under leading, trailing, and multiple spaces', () => {
    expect(calculateGroundednessScore('  cat  dog  ', '  cat  dog  ')).toBe(1)
    expect(calculateGroundednessScore('cat dog', '  cat   dog  ')).toBe(1)
  })
})

describe('calculateBenchmarkScore', () => {
  it('returns zeros for empty results', () => {
    const result = calculateBenchmarkScore([])
    expect(result.avg_score).toBe(0)
    expect(result.avg_latency).toBe(0)
    expect(result.avg_tokens).toBe(0)
    expect(result.success_rate).toBe(0)
  })

  it('computes averages correctly', () => {
    const results = [
      { score: 0.8, latency_ms: 100, tokens: 50 },
      { score: 0.6, latency_ms: 200, tokens: 100 },
    ]
    const agg = calculateBenchmarkScore(results)
    expect(agg.avg_score).toBeCloseTo(0.7)
    expect(agg.avg_latency).toBeCloseTo(150)
    expect(agg.avg_tokens).toBeCloseTo(75)
  })

  it('computes success rate correctly (threshold 0.5)', () => {
    const results = [
      { score: 0.8, latency_ms: 100, tokens: 50 },
      { score: 0.3, latency_ms: 200, tokens: 100 },
      { score: 0.9, latency_ms: 150, tokens: 75 },
    ]
    const agg = calculateBenchmarkScore(results)
    expect(agg.success_rate).toBeCloseTo(2 / 3)
  })
})
