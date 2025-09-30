# Contributing to Prometheus Client

Thank you for your interest in contributing to the Prometheus Client library! We welcome contributions from the community and are pleased to have you participate.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a feature branch
4. Make your changes
5. Add tests for your changes
6. Run the test suite
7. Submit a pull request

## Development Setup

### Prerequisites

- Node.js (version 18 or higher)
- npm (comes with Node.js)
- Git

### Installation

1. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/prom-client.git
cd prom-client
```

2. Install dependencies:
```bash
npm install
```

3. Verify the setup by running tests:
```bash
npm test
```

### Scripts

The project includes several npm scripts:

```bash
# Run tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Build the project
npm run build

# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format
```

## Project Structure

```
prom-client/
├── src/                    # Source code
│   ├── index.ts           # Main entry point and exports
│   └── metrics/           # Metric implementations
│       ├── Counter.ts     # Counter metric
│       ├── Gauge.ts       # Gauge metric
│       └── Histogram.ts   # Histogram metric
├── test/                  # Test files
│   ├── Counter.test.ts    # Counter tests
│   ├── Gauge.test.ts      # Gauge tests
│   └── Histogram.test.ts  # Histogram tests
├── dist/                  # Built output (generated)
├── docs/                  # Documentation
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest test configuration
└── README.md              # Project README
```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation changes
- `refactor/` - for code refactoring
- `test/` - for adding or fixing tests

Examples:
- `feature/add-summary-metric`
- `fix/histogram-bucket-sorting`
- `docs/update-api-examples`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
```
feat: add Summary metric type

fix(histogram): correct bucket sorting for negative values

docs: update API examples in README

test(gauge): add tests for label validation
```

## Coding Standards

### TypeScript Guidelines

1. **Type Safety**: Use strict TypeScript settings. Avoid `any` types.
2. **Interfaces**: Prefer interfaces for object shapes when possible.
3. **Generics**: Use generics for reusable code.
4. **Null Safety**: Handle null and undefined explicitly.

### Code Style

We use Prettier for code formatting and ESLint for linting. The configuration is included in the project.

**Key style points:**
- Use 4 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Trailing commas in multi-line structures
- Line length limit of 100 characters

### Error Handling

1. **Validation**: Validate inputs and throw descriptive errors
2. **Error Types**: Use appropriate error types (TypeError, Error, etc.)
3. **Error Messages**: Provide clear, actionable error messages
4. **Documentation**: Document all possible errors in JSDoc comments

Example:
```typescript
/**
 * Increment the counter
 * @param labels - Array of label values
 * @param amount - Amount to increment by (must be positive)
 * @throws {Error} When label count doesn't match
 * @throws {TypeError} When amount is not a valid number
 */
inc(labels: string[], amount: number = 1): void {
    if (labels.length !== this.labels.length) {
        throw new Error(`Label count mismatch, expected ${this.labels.length} but got ${labels.length}`);
    }
    
    if (typeof amount !== 'number' || isNaN(amount) || !Number.isFinite(amount)) {
        throw new TypeError(`Amount is not a valid finite number: ${amount}`);
    }
    
    if (amount < 0) {
        throw new Error('Counter cannot be decreased');
    }
    
    // ... implementation
}
```

### Documentation

1. **JSDoc**: Use JSDoc comments for all public APIs
2. **Examples**: Include examples in documentation
3. **Types**: Document parameter and return types
4. **Exceptions**: Document all thrown exceptions

## Testing

### Test Structure

We use Jest for testing. Tests should be comprehensive and cover:

1. **Happy Path**: Normal usage scenarios
2. **Edge Cases**: Boundary conditions and unusual inputs
3. **Error Cases**: Invalid inputs and error conditions
4. **Type Safety**: TypeScript type checking

### Test Categories

1. **Unit Tests**: Test individual methods and classes
2. **Integration Tests**: Test interactions between components
3. **Performance Tests**: Ensure acceptable performance characteristics

### Writing Tests

```typescript
import { Counter } from '../src/metrics/Counter.js';

describe('Counter', () => {
    let counter: Counter;
    
    beforeEach(() => {
        counter = new Counter('test_counter', 'Test counter', ['method']);
    });
    
    describe('inc()', () => {
        it('should increment by default amount', () => {
            counter.inc(['GET']);
            expect(counter.getValue(['GET'])).toBe(1);
        });
        
        it('should increment by custom amount', () => {
            counter.inc(['GET'], 5);
            expect(counter.getValue(['GET'])).toBe(5);
        });
        
        it('should throw error for negative values', () => {
            expect(() => counter.inc(['GET'], -1))
                .toThrow('Counter cannot be decreased');
        });
    });
});
```

### Test Coverage

- Maintain high test coverage (aim for >90%)
- All new features must include tests
- Bug fixes must include regression tests

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test Counter.test.ts
```

## Documentation

### Code Documentation

- Use JSDoc for all public APIs
- Include parameter descriptions and types
- Document return values
- List all possible exceptions
- Provide usage examples

### README Updates

When adding new features:
1. Update the feature list
2. Add API documentation
3. Include usage examples
4. Update the table of contents if needed

### API Documentation

Follow this format for API documentation:

```typescript
/**
 * Creates a new histogram metric
 * 
 * @param name - The metric name (must be valid Prometheus metric name)
 * @param help - Help text describing the metric
 * @param buckets - Array of bucket upper bounds (must be sorted)
 * @param labels - Array of label names (optional)
 * 
 * @throws {Error} When buckets are not properly sorted
 * @throws {TypeError} When parameters are invalid types
 * 
 * @example
 * ```typescript
 * const histogram = new Histogram(
 *   'request_duration_seconds',
 *   'HTTP request duration in seconds',
 *   [0.1, 0.5, 1.0, 2.5, 5.0, 10.0],
 *   ['method', 'route']
 * );
 * 
 * histogram.observe(['GET', '/api/users'], 0.234);
 * ```
 */
```

## Pull Request Process

### Before Submitting

1. **Fork and Branch**: Create a feature branch from `main`
2. **Code**: Implement your changes following coding standards
3. **Test**: Add comprehensive tests for new functionality
4. **Documentation**: Update documentation as needed
5. **Self Review**: Review your own code before submitting

### PR Requirements

1. **Description**: Provide a clear description of changes
2. **Issue Link**: Reference any related issues
3. **Testing**: Include test results or coverage reports
4. **Breaking Changes**: Highlight any breaking changes
5. **Migration Guide**: Provide migration instructions if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] No decrease in test coverage

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Verify all tests pass
4. **Documentation**: Ensure docs are updated
5. **Approval**: PR approved by maintainer

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Version Bump**: Update version in `package.json`
2. **Changelog**: Update `CHANGELOG.md` with changes
3. **Tag**: Create git tag for version
4. **Build**: Generate distribution files
5. **Publish**: Publish to npm registry
6. **Documentation**: Update documentation

### Maintenance

- **LTS Versions**: Critical bug fixes for supported versions
- **Security**: Security patches for all supported versions
- **Dependencies**: Regular dependency updates

## Questions and Support

- **Issues**: Use GitHub issues for bug reports and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Documentation**: Check README.md and inline documentation first

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project documentation acknowledgments

Thank you for contributing to Promlite!