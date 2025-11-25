#!/bin/bash
# Simulate GitHub Actions CI workflow locally

cd server

echo "=== Simulating GitHub Actions CI Workflow ==="
echo ""
echo "Step 1: Setup (already done)"
echo "Step 2: Install dependencies..."
npm install --silent > /dev/null 2>&1
echo "✓ Dependencies installed"

echo ""
echo "Step 3: Build project..."
npm run build > /dev/null 2>&1
echo "✓ Build complete"

echo ""
echo "Step 4: Run config-scan (JSON report)..."
node dist/server.js . --format=json --out=./reports
echo "✓ Scan complete"

echo ""
echo "Step 5: Enforce HIGH/CRITICAL blocking..."
node dist/utils/ciCheck.js ./reports/report.json
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "🎉 CI Workflow: PASSED"
else
    echo "❌ CI Workflow: FAILED (blocking findings detected)"
fi

exit $EXIT_CODE
