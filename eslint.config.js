import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  // ESLint recommended rules for all files
  js.configs.recommended,
  
  // Configuration for example files (must come before main config)
  {
    files: ['examples/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      // General JavaScript rules for examples (formatting rules removed - handled by Prettier)
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'off', // Allow console in examples
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all']
    }
  },
  
  // Apply to TypeScript files and non-example JavaScript files
  {
    files: ['**/*.{mjs,cjs,ts}', '**/*.js'],
    ignores: ['examples/**/*.js'], // Exclude examples from this config
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // General JavaScript/TypeScript rules (formatting rules removed - handled by Prettier)
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all']
    }
  },
  
  // Configuration for test files
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/tests/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      // Relax some rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off'
    }
  },
  
  // Configuration for example files
  {
    files: ['examples/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      // Don't use TypeScript parser for example JS files
      parser: undefined,
      parserOptions: undefined,
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        module: 'writable',
        require: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    rules: {
      // Relax some rules for example files
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  
  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      'dist/',
      'lib/',
      'build/',
      'coverage/',
      '*.min.js',
      '.git/',
      '.github/',
      'eslint.config.js' // Ignore this config file itself
    ]
  },
  
  // Prettier config to disable conflicting rules (must be last)
  prettierConfig
];
