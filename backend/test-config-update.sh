#!/bin/bash

# Test script for config update endpoint
# Usage: ./test-config-update.sh

SITE_ID="223e4567-e89b-12d3-a456-426614174111"
API_URL="http://localhost:3001"

echo "=========================================="
echo "Testing Config Update Endpoint"
echo "=========================================="
echo ""

# Test 1: GET existing config
echo "1. Fetching current config..."
echo "GET ${API_URL}/config/${SITE_ID}"
echo ""
curl -s "${API_URL}/config/${SITE_ID}" | jq .
echo ""
echo ""

# Test 2: UPDATE config with valid data
echo "2. Updating config with valid data..."
echo "PUT ${API_URL}/config/${SITE_ID}"
echo ""

curl -s -X PUT "${API_URL}/config/${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "bannerText": {
        "en": {
          "title": "Updated Cookie Consent",
          "description": "We use cookies to enhance your experience.",
          "acceptAll": "Accept All",
          "declineAll": "Decline All",
          "saveSettings": "Save Settings"
        },
        "de": {
          "title": "Cookie-Zustimmung",
          "description": "Wir verwenden Cookies.",
          "acceptAll": "Alle akzeptieren",
          "declineAll": "Alle ablehnen",
          "saveSettings": "Einstellungen speichern"
        }
      },
      "styles": {
        "primaryColor": "#10b981",
        "secondaryColor": "#065f46",
        "textColor": "#ffffff",
        "backgroundColor": "#1f2937",
        "position": "bottom",
        "layout": "banner",
        "borderRadius": "8px"
      },
      "categories": {
        "necessary": {
          "name": "Necessary",
          "description": "Essential cookies",
          "required": true,
          "enabled": true
        },
        "analytics": {
          "name": "Analytics",
          "description": "Usage tracking",
          "required": false,
          "enabled": false
        }
      },
      "languages": ["en", "de"],
      "services": []
    }
  }' | jq .

echo ""
echo ""

# Test 3: Verify update worked
echo "3. Verifying update..."
echo "GET ${API_URL}/config/${SITE_ID}"
echo ""
curl -s "${API_URL}/config/${SITE_ID}" | jq .
echo ""
echo ""

# Test 4: Invalid color format (should fail)
echo "4. Testing validation with invalid color..."
echo "PUT ${API_URL}/config/${SITE_ID} (invalid)"
echo ""

curl -s -X PUT "${API_URL}/config/${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "styles": {
        "primaryColor": "not-a-color",
        "position": "invalid-position"
      }
    }
  }' | jq .

echo ""
echo ""

# Test 5: Missing required fields (should fail)
echo "5. Testing validation with empty languages..."
echo "PUT ${API_URL}/config/${SITE_ID} (invalid)"
echo ""

curl -s -X PUT "${API_URL}/config/${SITE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "languages": []
    }
  }' | jq .

echo ""
echo ""
echo "=========================================="
echo "Tests complete!"
echo "=========================================="
