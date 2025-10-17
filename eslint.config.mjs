import { createConfigForNuxt } from '@nuxt/eslint-config'

export default createConfigForNuxt({
  features: {
    stylistic: true,
  },
}).append({
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@stylistic/no-multiple-empty-lines': [
      'error',
      {
        max: 3,
        maxEOF: 3,
        maxBOF: 0,
      },
    ],
    '@stylistic/padded-blocks': 'off',
    '@stylistic/brace-style': 'off',
    '@stylistic/no-trailing-spaces': [
      'error',
      {
        skipBlankLines: true,
      },
    ],
  },
})
