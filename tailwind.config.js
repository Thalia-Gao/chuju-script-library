/**
 * Jscbc: Tailwind 配置
 */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './楚剧荟・剧本数字典藏馆.html'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#dc2626',
          700: '#b91c1c'
        }
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'Inter', 'serif']
      }
    }
  },
  plugins: []
}; 