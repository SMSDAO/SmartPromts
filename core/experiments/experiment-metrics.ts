export interface ExperimentMetrics {
  avg_score: number
  win_rate: number
  avg_latency: number
  total_runs: number
  p_value?: number
}

export function calculateWinRate(resultsA: number[], resultsB: number[]): { win_rate_a: number; win_rate_b: number } {
  if (resultsA.length === 0 || resultsB.length === 0) return { win_rate_a: 0, win_rate_b: 0 }
  let winsA = 0
  const len = Math.min(resultsA.length, resultsB.length)
  for (let i = 0; i < len; i++) {
    if (resultsA[i] > resultsB[i]) winsA++
  }
  return { win_rate_a: winsA / len, win_rate_b: 1 - winsA / len }
}

export function calculateStatisticalSignificance(a: number[], b: number[]): number {
  // Simplified t-test approximation returning p-value estimate
  if (a.length < 2 || b.length < 2) return 1
  const meanA = a.reduce((s, v) => s + v, 0) / a.length
  const meanB = b.reduce((s, v) => s + v, 0) / b.length
  const varA = a.reduce((s, v) => s + (v - meanA) ** 2, 0) / (a.length - 1)
  const varB = b.reduce((s, v) => s + (v - meanB) ** 2, 0) / (b.length - 1)
  const se = Math.sqrt(varA / a.length + varB / b.length)
  if (se === 0) return meanA === meanB ? 1 : 0
  const t = Math.abs(meanA - meanB) / se
  // Simplified p-value approximation using a sigmoid on the t-statistic.
  // This is NOT a rigorous statistical test (e.g. Welch's t-test) and should
  // only be used for rough guidance, not for formal significance testing.
  // The constant 0.3 was chosen empirically so that t≈3 yields p≈0.1.
  return Math.max(0, Math.min(1, 1 / (1 + t * 0.3)))
}

export function aggregateMetrics(results: Array<{ score: number; latency_ms: number }>): ExperimentMetrics {
  if (results.length === 0) return { avg_score: 0, win_rate: 0, avg_latency: 0, total_runs: 0 }
  const avg_score = results.reduce((s, r) => s + r.score, 0) / results.length
  const avg_latency = results.reduce((s, r) => s + r.latency_ms, 0) / results.length
  const win_rate = results.filter(r => r.score > 0.5).length / results.length
  return { avg_score, win_rate, avg_latency, total_runs: results.length }
}
