/**
 * Production-grade structured logger using Pino.
 *
 * In production: emits newline-delimited JSON.
 * In development: emits pretty-printed output via pino-pretty (if installed).
 * In test: silenced by default (level 'silent').
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.info({ userId }, 'User logged in')
 *   logger.error({ err }, 'Something went wrong')
 */

import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

const pinoOptions: pino.LoggerOptions = {
  level: isTest ? 'silent' : isDevelopment ? 'debug' : 'info',
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version ?? '1.0.0',
  },
  // Redact common secrets from logs
  redact: {
    paths: [
      'password',
      'token',
      'apiKey',
      'api_key',
      'secret',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.apiKey',
      '*.api_key',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
}

// Use pino-pretty in development when available; fall back to plain pino.
function createLogger(): pino.Logger {
  if (isDevelopment) {
    try {
      // Dynamic require so Next.js webpack can tree-shake this in production builds
      const pretty = require('pino-pretty') // eslint-disable-line
      return pino(
        pinoOptions,
        pretty({
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        }),
      )
    } catch {
      // pino-pretty not installed – fall through to plain pino
    }
  }
  return pino(pinoOptions)
}

export const logger = createLogger()

// ---------------------------------------------------------------------------
// Request-scoped child logger factory
// ---------------------------------------------------------------------------

export interface RequestLogContext {
  requestId?: string
  method?: string
  path?: string
  userId?: string
  [key: string]: unknown
}

/**
 * Create a child logger pre-populated with request context.
 * Keeps structured fields consistent across a single request lifecycle.
 */
export function requestLogger(context: RequestLogContext): pino.Logger {
  return logger.child(context)
}

export default logger
