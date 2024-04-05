const antfu = require('@antfu/eslint-config').default

module.exports = antfu(
    {
        stylistic: {
            indent: 4, // 4, or 'tab'
            quotes: 'single', // or 'double'
        },
        rules: {
            'jsx-quotes': ['error', 'prefer-double'],
            'no-console': 'off',
            'node/prefer-global/process': 'off',
            'object-curly-newline': ['error', {
                ObjectExpression: {
                    multiline: true,
                    minProperties: 2,
                },
                ObjectPattern: {
                    multiline: true,
                    minProperties: 2,
                },
                ImportDeclaration: {
                    multiline: true,
                    minProperties: 3,
                },
                ExportDeclaration: {
                    multiline: true,
                    minProperties: 1,
                },
            }],
        },
        globals: {
            RES: true,
            REQ: true,
            wx: true,
        },
    },
)
