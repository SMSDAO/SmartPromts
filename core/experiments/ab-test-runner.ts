import { runBenchmark } from '../benchmarking/benchmark-runner'
import { aggregateMetrics, calculateWinRate, calculateStatisticalSignificance, type ExperimentMetrics } from './experiment-metrics'

export interface ABTestResult {
  experiment_id: string
  prompt_a_id: string
  prompt_b_id: string
  winner: string
  confidence: number
  metrics_a: ExperimentMetrics
  metrics_b: ExperimentMetrics
}

export async function runABTest(
  promptA: { id: string; prompt: string },
  promptB: { id: string; prompt: string },
  inputs: string[],
  expected?: string[]
): Promise<ABTestResult> {
  const examples = inputs.map(i => ({ input: i }))
  const exp = expected ?? inputs.map(() => '')
  const experimentId = Math.random().toString(36).substring(2, 11)

  const [resultA, resultB] = await Promise.all([
    runBenchmark(promptA.id, promptA.prompt, 'ab-test', examples, exp),
    runBenchmark(promptB.id, promptB.prompt, 'ab-test', examples, exp),
  ])

  const scoresA = resultA.results.map(r => r.score)
  const scoresB = resultB.results.map(r => r.score)

  const { win_rate_a } = calculateWinRate(scoresA, scoresB)
  const pValue = calculateStatisticalSignificance(scoresA, scoresB)
  const confidence = 1 - pValue

  const metricsA = aggregateMetrics(resultA.results.map(r => ({ score: r.score, latency_ms: r.latency_ms })))
  const metricsB = aggregateMetrics(resultB.results.map(r => ({ score: r.score, latency_ms: r.latency_ms })))

  const winner = win_rate_a >= 0.5 ? promptA.id : promptB.id

  return {
    experiment_id: experimentId,
    prompt_a_id: promptA.id,
    prompt_b_id: promptB.id,
    winner,
    confidence,
    metrics_a: metricsA,
    metrics_b: metricsB,
  }
}
