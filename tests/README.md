# Tests

This directory contains unit and integration tests for SmartPromts.

## Structure

```
tests/
├── unit/          Unit tests for lib/ utilities and src/services/
└── integration/   Integration tests for API routes and external services
```

## Running Tests

```bash
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # run with coverage report
```

The CI workflow (`.github/workflows/test.yml`) runs `npm test` and will fail if any tests fail.

## Adding Tests

Test files follow the naming convention `*.test.ts` or `*.spec.ts`.

- Unit tests: place in `tests/unit/` mirroring the source structure.
- Integration tests: place in `tests/integration/` with descriptive names.

Tests use [Vitest](https://vitest.dev/) and can be run locally or in CI without any external services.
