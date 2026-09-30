#!/usr/bin/env bash
set -euo pipefail

# Find all Dart test files under test/ and run flutter test on each.
# This is a helper to work around test discovery issues in this workspace.

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT_DIR"

echo "Discovering Flutter test files under test/"
mapfile -t files < <(find test -type f -name "*_test.dart" | sort)

if [ ${#files[@]} -eq 0 ]; then
  echo "No test files found under test/"
  exit 1
fi

for f in "${files[@]}"; do
  echo "\n=== Running: $f ==="
  flutter test "$f" -r expanded
done

echo "\nAll tests completed."
