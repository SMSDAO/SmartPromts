# Tests

This directory contains unit and integration tests for SmartPromts.

## Structure

```
tests/
├── unit/          Unit tests for lib/ utilities and src/services/
└── integration/   Integration tests for API routes and external services
```

## Running Tests

The CI workflow (`.github/workflows/test.yml`) runs `npm test --if-present`. Because there
is currently no `test` script defined in `package.json`, the step is a no-op — it will not
fail CI. Once a test runner is configured and a `test` script is added, the `--if-present`
flag should be removed so CI enforces that all tests pass.
## Adding Tests

Test files follow the naming convention `*.test.ts` or `*.spec.ts`.

- Unit tests: co-locate in `tests/unit/` mirroring the source structure.
- Integration tests: place in `tests/integration/` with descriptive names.
