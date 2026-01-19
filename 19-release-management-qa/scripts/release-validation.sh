#!/bin/bash
# Release Validation Script
# Validações de qualidade antes do release

set -e

echo ""
echo "════════════════════════════════════════"
echo "🌟 Release Validation"
echo "════════════════════════════════════════"
echo ""

VERSION=${1:-"unknown"}
CHECKS_PASSED=0
CHECKS_FAILED=0

check_pass() {
    echo "✅ $1"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo "❌ $1"
    ((CHECKS_FAILED++))
}

# 1. Unit Tests
echo "🧪 Running unit tests..."
if npm run test:unit -- --coverage --ci; then
    check_pass "Unit tests passed"
else
    check_fail "Unit tests failed"
fi

# 2. Coverage Threshold
echo ""
echo "📊 Checking coverage threshold..."
COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
if (( $(echo "$COVERAGE >= 80" | bc -l) )); then
    check_pass "Coverage: ${COVERAGE}% (threshold: 80%)"
else
    check_fail "Coverage: ${COVERAGE}% (below 80% threshold)"
fi

# 3. Integration Tests
echo ""
echo "🔗 Running integration tests..."
if npm run test:integration; then
    check_pass "Integration tests passed"
else
    check_fail "Integration tests failed"
fi

# 4. Security Scan
echo ""
echo "🔐 Running security scan..."
if npm audit --audit-level=high; then
    check_pass "No high/critical vulnerabilities"
else
    check_fail "Security vulnerabilities detected"
fi

# 5. Lint Check
echo ""
echo "📝 Running lint check..."
if npm run lint; then
    check_pass "Lint check passed"
else
    check_fail "Lint errors found"
fi

# 6. Type Check
echo ""
echo "🖥️ Running type check..."
if npm run type-check; then
    check_pass "Type check passed"
else
    check_fail "Type errors found"
fi

# 7. Build Check
echo ""
echo "📦 Running build..."
if npm run build; then
    check_pass "Build successful"
else
    check_fail "Build failed"
fi

# Summary
echo ""
echo "════════════════════════════════════════"
echo "📊 Release Validation Summary"
echo "════════════════════════════════════════"
echo "Version: $VERSION"
echo "Passed: $CHECKS_PASSED"
echo "Failed: $CHECKS_FAILED"
echo "════════════════════════════════════════"

if [ $CHECKS_FAILED -gt 0 ]; then
    echo ""
    echo "❌ Release validation FAILED"
    echo "Please fix the issues above before releasing."
    exit 1
fi

echo ""
echo "✅ Release validation PASSED"
echo "Ready to release version $VERSION"
exit 0
