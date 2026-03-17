export interface ModelInfo {
  name: string
  provider: string
  context_length: number
  cost_per_token: number
  latency_estimate: number
  accuracy_score: number
}

export const MODEL_REGISTRY: Record<string, ModelInfo> = {
  'gpt-4': {
    name: 'gpt-4',
    provider: 'openai',
    context_length: 8192,
    cost_per_token: 0.00003,
    latency_estimate: 3000,
    accuracy_score: 0.95,
  },
  'gpt-3.5-turbo': {
    name: 'gpt-3.5-turbo',
    provider: 'openai',
    context_length: 16385,
    cost_per_token: 0.000002,
    latency_estimate: 800,
    accuracy_score: 0.80,
  },
  'claude-3-opus': {
    name: 'claude-3-opus-20240229',
    provider: 'anthropic',
    context_length: 200000,
    cost_per_token: 0.000015,
    latency_estimate: 2500,
    accuracy_score: 0.93,
  },
  'gemini-pro': {
    name: 'gemini-pro',
    provider: 'google',
    context_length: 32768,
    cost_per_token: 0.000001,
    latency_estimate: 1200,
    accuracy_score: 0.82,
  },
  'local-llama': {
    name: 'llama3',
    provider: 'local',
    context_length: 8192,
    cost_per_token: 0,
    latency_estimate: 2000,
    accuracy_score: 0.70,
  },
}

export function getModel(name: string): ModelInfo | undefined {
  return MODEL_REGISTRY[name] ?? Object.values(MODEL_REGISTRY).find(m => m.name === name)
}

export function listModels(): ModelInfo[] {
  return Object.values(MODEL_REGISTRY)
}

export function getModelsByProvider(provider: string): ModelInfo[] {
  return Object.values(MODEL_REGISTRY).filter(m => m.provider === provider)
}
