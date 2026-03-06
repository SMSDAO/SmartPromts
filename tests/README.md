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
npm test
```

## Adding Tests

Test files follow the naming convention `*.test.ts` or `*.spec.ts`.

- Unit tests: co-locate in `tests/unit/` mirroring the source structure.
- Integration tests: place in `tests/integration/` with descriptive names.
