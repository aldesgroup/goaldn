const plugin = require('tailwindcss');

module.exports = {
    arrowParens: 'avoid',
    bracketSameLine: true,
    bracketSpacing: false,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 150,
    tabWidth: 4,
    plugins: ['prettier-plugin-tailwindcss'],
};
