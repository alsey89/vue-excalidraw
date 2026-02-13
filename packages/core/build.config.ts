import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      builder: 'mkdist',
      input: './src',
      outDir: './dist',
      pattern: ['**', '!**/*.test.ts'],
    },
  ],
  declaration: true,
  externals: [
    'vue',
    'react',
    'react-dom',
    'react-dom/client',
    '@excalidraw/excalidraw',
    '@excalidraw/excalidraw/types',
    '@vitejs/plugin-react',
    'vite',
  ],
})
