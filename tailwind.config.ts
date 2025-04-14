import type {Config} from 'tailwindcss';

const config = {
    presets: [require('nativewind/preset')],
    content: ['./lib/**/*.{ts,tsx}'],
} satisfies Config;

export default config;
