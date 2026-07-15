// 测试 Vite 是否把 rollupOptions.treeshake 传给 Rollup
import { build } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 最小测试配置
const result = await build({
  root: __dirname,
  logLevel: 'info',
  build: {
    outDir: 'dist-test',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'vite_test_input.js'),
      treeshake: false,
      output: {
        format: 'iife',
        entryFileNames: 'bundle.js'
      }
    },
  }
});

// 检查输出
import fs from 'fs';
const code = fs.readFileSync(path.resolve(__dirname, 'dist-test/bundle.js'), 'utf8');
console.log('=== Vite build output (direct rollupOptions.treeshake: false) ===');
console.log('contains goodbye():', code.includes('goodbye()') || code.includes('function goodbye'));
console.log('contains hello():', code.includes('function hello'));
