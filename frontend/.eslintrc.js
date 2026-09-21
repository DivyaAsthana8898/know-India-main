module.exports = {
  extends: ['react-app', 'react-app/jest'],
  plugins: ['unused-imports'],
  rules: {
    // Unused imports - error in CI, warning locally
    'no-unused-vars': 'off', // Disable base rule as it can conflict
    'unused-imports/no-unused-imports': process.env.CI ? 'error' : 'warn',
    'unused-imports/no-unused-vars': [
      process.env.CI ? 'error' : 'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    // Anonymous default exports
    'import/no-anonymous-default-export': 'error',
  },
};
