module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    "ecmaVersion": 2018,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "no-restricted-globals": ["error", "name", "length"],
    "prefer-arrow-callback": "error",
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "max-len": ["error", {
      code: 120, // Maximum line length for code
      tabWidth: 2, // Character width for tab characters
      ignoreComments: true, // Ignore line length for comments
      ignoreUrls: true, // Ignore line length for URLs
      ignoreStrings: true, // Ignore line length for strings
      ignoreTemplateLiterals: true, // Ignore line length for template literals
      ignoreRegExpLiterals: true, // Ignore line length for regular expression literals
    }],
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
