export default {
  input: 'rollup_test_input.js',
  output: {
    file: 'rollup_test_output2.js',
    format: 'iife'
  }
  // treeshake 不设置 = Rollup 默认开启 tree shaking
};
