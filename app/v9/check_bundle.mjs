import fs from 'fs';

const bundle = fs.readFileSync('dist/assets/main-DRXCunpu.js','utf8');
const source = fs.readFileSync('src/app.js','utf8');

// 提取 app.js 中所有函数定义
const namedFuncs = [...source.matchAll(/(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(/g)].map(m => m[1]);
const methods = [...source.matchAll(/(\w+)\s*=\s*(?:async\s+)?function\s*\(/g)].map(m => m[1]);

const allFuncs = [...new Set([...namedFuncs, ...methods])].sort();
console.log('=== Source 定义的所有函数在 bundle 中的保留情况 ===\n');
for (const name of allFuncs) {
  const found = bundle.includes(name);
  console.log(`  ${found ? '✅' : '❌'} ${name}`);
}

// 检查底部 init() 调用
console.log('\n=== 底部 init() 调用 ===');
console.log('  Source 中 init():', source.includes('\ninit();') ? '存在' : '不存在');
console.log('  Bundle 中 init():', bundle.includes('init()') ? '✅ 存在' : '❌ 不存在');

// 静态函数引用检查
console.log('\n=== 函数引用（source 中函数名被引用的次数）===');
for (const name of allFuncs) {
  const sourceCount = (source.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const bundleCount = (bundle.match(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (bundleCount < sourceCount) {
    console.log(`  ⚠️  ${name}: source ${sourceCount}次 → bundle ${bundleCount}次 (减少${sourceCount - bundleCount}次)`);
  }
}

console.log('\n总计：', allFuncs.length, '个函数');
