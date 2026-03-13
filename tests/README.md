# Tests

This directory contains unit and integration tests for SmartPromts.

## Structure

```
tests/
├── unit/          Unit tests for lib/ utilities and src/services/
└── integration/   Integration tests for API routes and external services
```

## Running Tests

Tests are not yet wired up via `npm test` because there is currently no `test` script
defined in `package.json`. Once a test runner is configured and a `test` script is
added, this section should be updated with the exact command (for example,
`npm test` or `npm run <runner>`).

In the meantime, tests can be added and maintained in this directory, but they
cannot be executed via a standardized npm script yet.
## Adding Tests

Test files follow the naming convention `*.test.ts` or `*.spec.ts`.

- Unit tests: co-locate in `tests/unit/` mirroring the source structure.
- Integration tests: place in `tests/integration/` with descriptive names.
