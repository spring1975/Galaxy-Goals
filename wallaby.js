module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.ts',
      '!src/**/*.spec.ts',
      '!src/**/*.d.ts',
      'tsconfig.json',
      'tsconfig.spec.json',
      'jest.config.js',
      'src/test-setup.ts'
    ],

    tests: [
      'src/**/*.spec.ts'
    ],

    env: {
      type: 'node',
      runner: 'node'
    },

    testFramework: 'jest',

    setup: function (wallaby) {
      const jestConfig = require('./jest.config.js');
      wallaby.testFramework.configure(jestConfig);
    },

    compilers: {
      '**/*.ts': wallaby.compilers.typeScript({
        module: 'commonjs',
        getCustomTransformers: () => {
          return {
            before: [
              require('jest-preset-angular/build/InlineFilesTransformer').default,
              require('jest-preset-angular/build/StripStylesTransformer').default,
            ]
          };
        }
      })
    },

    preprocessors: {
      '**/*.js': file => require('@babel/core').transform(
        file.content,
        {
          sourceMap: true,
          filename: file.path,
          presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
          plugins: ['@babel/plugin-proposal-class-properties']
        })
    },

    hints: {
      ignoreCoverage: /ignore coverage/
    }
  };
};
