#!/bin/bash

# Test script for CMP API endpoints
# Make sure the backend server is running before executing this script

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001"
SITE_ID="223e4567-e89b-12d3-a456-426614174111"

echo -e "${YELLOW}=== CMP API Endpoint Testing ===${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
echo "GET $API_URL/health"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/health")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi
echo ""

# Test 2: GET /config/:siteId
echo -e "${YELLOW}Test 2: Get Site Configuration${NC}"
echo "GET $API_URL/config/$SITE_ID"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/config/$SITE_ID")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi
echo ""

# Test 3: POST /consent (with userId)
echo -e "${YELLOW}Test 3: Create Consent Record (with userId)${NC}"
echo "POST $API_URL/consent"
CONSENT_DATA='{
  "siteId": "'"$SITE_ID"'",
  "userId": "test-user-123",
  "choices": {
    "analytics": true,
    "marketing": false
  }
}'
echo "Body: $CONSENT_DATA"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST "$API_URL/consent" \
  -H "Content-Type: application/json" \
  -d "$CONSENT_DATA")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi
echo ""

# Test 4: POST /consent (anonymous - null userId)
echo -e "${YELLOW}Test 4: Create Consent Record (anonymous)${NC}"
echo "POST $API_URL/consent"
CONSENT_DATA_ANON='{
  "siteId": "'"$SITE_ID"'",
  "userId": null,
  "choices": {
    "analytics": false,
    "marketing": false
  }
}'
echo "Body: $CONSENT_DATA_ANON"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST "$API_URL/consent" \
  -H "Content-Type: application/json" \
  -d "$CONSENT_DATA_ANON")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi
echo ""

# Test 5: GET /consent/:siteId (all records)
echo -e "${YELLOW}Test 5: Get All Consent Records for Site${NC}"
echo "GET $API_URL/consent/$SITE_ID"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/consent/$SITE_ID")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi
echo ""

# Test 6: GET /consent/:siteId?userId=test-user-123 (filtered)
echo -e "${YELLOW}Test 6: Get Consent Records Filtered by userId${NC}"
echo "GET $API_URL/consent/$SITE_ID?userId=test-user-123"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/consent/$SITE_ID?userId=test-user-123")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    echo "Response: $BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}✗ FAILED${NC} (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi
echo ""

# Test 7: Error handling - Invalid UUID
echo -e "${YELLOW}Test 7: Error Handling - Invalid UUID${NC}"
echo "GET $API_URL/config/invalid-uuid"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/config/invalid-uuid")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Correctly rejected invalid UUID)"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ FAILED${NC} (Expected HTTP 400, got $HTTP_CODE)"
    echo "Response: $BODY"
fi
echo ""

# Test 8: Error handling - Missing required field
echo -e "${YELLOW}Test 8: Error Handling - Missing Required Field${NC}"
echo "POST $API_URL/consent"
INVALID_DATA='{"siteId": "'"$SITE_ID"'"}'
echo "Body: $INVALID_DATA (missing choices field)"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST "$API_URL/consent" \
  -H "Content-Type: application/json" \
  -d "$INVALID_DATA")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}✓ PASSED${NC} (Correctly rejected missing field)"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ FAILED${NC} (Expected HTTP 400, got $HTTP_CODE)"
    echo "Response: $BODY"
fi
echo ""

echo -e "${YELLOW}=== Testing Complete ===${NC}"
