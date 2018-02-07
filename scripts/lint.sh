#!/usr/bin/env bash
# Disabled until the moment of correcting all the API files and reviewing the linter rules
# Run esLint
eslint -c web-dapp/.eslintrc.yml --ignore-path web-dapp/.eslintignore web-dapp/;
lintStatus=$?

if [ $lintStatus -ne 0 ]; then
  echo "Error Lint fail.";
fi

exit $lintStatus;
