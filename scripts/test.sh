#!/usr/bin/env bash

# Run esLint
npm run lint;
lintStatus=$?

#if [ "$1" == "--ff" ] && [ $lintStatus -ne 0 ]; then
#  exit $lintStatus;
#fi

# Run api tests
npm run test:api -- $@;
apiStatus=$?

if [ "$1" == "--ff" ] && [ $apiStatus -ne 0 ]; then
  exit $apiStatus;
fi

if [ $lintStatus -eq 0 ] && [ $apiStatus -eq 0 ]; then
  exit 0;
fi

if [ $lintStatus -ne 0 ]; then
  echo "Lint failed"
fi

if [ $apiStatus -ne 0 ]; then
  echo "API tests failed"
fi

exit 1;
