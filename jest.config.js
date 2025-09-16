module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: '@happy-dom/jest-environment',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  transform: {
    '^.+\\.(ts|html)$': ['jest-preset-angular', {
      tsconfig: 'tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$',
    }],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'json'],
  coverageReporters: ['html'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)'
  ]
};
