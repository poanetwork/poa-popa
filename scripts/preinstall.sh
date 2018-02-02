#!/usr/bin/env bash

cp scripts/pre-push .git/hooks/ || true
chmod +x .git/hooks/pre-push