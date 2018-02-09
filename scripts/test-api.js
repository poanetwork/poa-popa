'use strict';

const shell = require('shelljs');
const argv = require('yargs').argv;
const { oneLine } = require('common-tags');

const coverage = {
    statements: 70,
    branches: 40,
    functions: 70,
    lines: 70
};

const mochaReporter = argv.mochaReporter || 'spec';
const commonMochaFlags = ` --colors --reporter ${mochaReporter}`;

// Run server tests
let serverTestsResult = shell.exec(
    [
        oneLine`
      nyc
        --reporter text-summary
        --reporter lcov
        --color
        -x 'web-dapp/build/**/*'
        -x 'web-dapp/postcard/**/*'
        -x 'web-dapp/public/**/*'
        -x 'web-dapp/src/**/*'
        -x 'web-dapp/tests/**/*'
        mocha ${commonMochaFlags} web-dapp/tests/index.js
    `,
        oneLine`
      nyc check-coverage
      --statements ${coverage.statements}
      --lines ${coverage.lines}
      --branchs ${coverage.branches}
      --functions ${coverage.functions}
    `
    ].join(' && ')
);

let serverTestsStatus = serverTestsResult.code;

if (serverTestsStatus !== 0) {
    shell.echo('Error: Tests failed.');
}
shell.exit(serverTestsStatus);
