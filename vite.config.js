import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export default defineConfig({
  base: '/portfolio/',
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkMath],
      rehypePlugins: [rehypeKatex],
      providerImportSource: '@mdx-js/react',
    }),
    react(),
  ],
})
