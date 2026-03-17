import { describe, it, expect } from 'vitest'
import { listModels, getModel, getModelsByProvider, MODEL_REGISTRY } from '../../core/orchestrator/model-registry'
import { routePrompt, selectModel, type RoutingStrategy } from '../../core/orchestrator/model-router'

describe('MODEL_REGISTRY', () => {
  it('contains at least 5 models', () => {
    expect(Object.keys(MODEL_REGISTRY).length).toBeGreaterThanOrEqual(5)
  })

  it('all models have required fields', () => {
    for (const model of Object.values(MODEL_REGISTRY)) {
      expect(model.name).toBeTruthy()
      expect(model.provider).toBeTruthy()
      expect(typeof model.context_length).toBe('number')
      expect(typeof model.cost_per_token).toBe('number')
      expect(typeof model.latency_estimate).toBe('number')
      expect(typeof model.accuracy_score).toBe('number')
    }
  })
})

describe('listModels', () => {
  it('returns an array of ModelInfo', () => {
    const models = listModels()
    expect(Array.isArray(models)).toBe(true)
    expect(models.length).toBeGreaterThan(0)
  })
})

describe('getModel', () => {
  it('returns model by registry key', () => {
    const model = getModel('gpt-4')
    expect(model).toBeDefined()
    expect(model?.provider).toBe('openai')
  })

  it('returns undefined for unknown model', () => {
    expect(getModel('nonexistent-model-xyz')).toBeUndefined()
  })
})

describe('getModelsByProvider', () => {
  it('returns only openai models', () => {
    const models = getModelsByProvider('openai')
    expect(models.length).toBeGreaterThan(0)
    for (const m of models) {
      expect(m.provider).toBe('openai')
    }
  })

  it('returns empty array for unknown provider', () => {
    expect(getModelsByProvider('unknown-provider')).toHaveLength(0)
  })
})

describe('selectModel', () => {
  it('lowest_cost selects cheapest model', () => {
    const models = listModels()
    const selected = selectModel('lowest_cost', models)
    const minCost = Math.min(...models.map(m => m.cost_per_token))
    expect(selected.cost_per_token).toBe(minCost)
  })

  it('lowest_latency selects fastest model', () => {
    const models = listModels()
    const selected = selectModel('lowest_latency', models)
    const minLatency = Math.min(...models.map(m => m.latency_estimate))
    expect(selected.latency_estimate).toBe(minLatency)
  })

  it('highest_accuracy selects most accurate model', () => {
    const models = listModels()
    const selected = selectModel('highest_accuracy', models)
    const maxAccuracy = Math.max(...models.map(m => m.accuracy_score))
    expect(selected.accuracy_score).toBe(maxAccuracy)
  })

  it('throws for empty candidate list', () => {
    expect(() => selectModel('lowest_cost', [])).toThrow()
  })
})

describe('routePrompt', () => {
  it('returns model name string', () => {
    const result = routePrompt('test prompt', 'highest_accuracy')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('manual strategy with override returns override model', () => {
    const result = routePrompt('test', 'manual', 'my-custom-model')
    expect(result).toBe('my-custom-model')
  })

  it('best_score returns a valid model name', () => {
    const result = routePrompt('test', 'best_score')
    const modelNames = listModels().map(m => m.name)
    expect(modelNames).toContain(result)
  })
})
