#!/bin/bash

# AbsurdLabs Email API Testing Script
# This script tests all email management endpoints

BASE_URL="http://localhost:3000"
TOKEN=""

echo "🧪 AbsurdLabs Email API Test Suite"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Register User
echo -e "${BLUE}Test 1: Register User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@absurdlabs.io",
    "password": "Test123!@#",
    "name": "Test User"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
echo ""

# Test 2: Login
echo -e "${BLUE}Test 2: Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@absurdlabs.io",
    "password": "Test123!@#"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo "$LOGIN_RESPONSE" | jq '.'
echo -e "${GREEN}Token: $TOKEN${NC}"
echo ""

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed! Cannot proceed with tests.${NC}"
  exit 1
fi

# Test 3: Create Label
echo -e "${BLUE}Test 3: Create Label${NC}"
LABEL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/labels" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Important",
    "color": "#EF4444"
  }')

LABEL_ID=$(echo "$LABEL_RESPONSE" | jq -r '.data._id')
echo "$LABEL_RESPONSE" | jq '.'
echo ""

# Test 4: Create Folder
echo -e "${BLUE}Test 4: Create Folder${NC}"
FOLDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/folders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Projects",
    "color": "#10B981",
    "icon": "briefcase"
  }')

echo "$FOLDER_RESPONSE" | jq '.'
echo ""

# Test 5: Save Draft
echo -e "${BLUE}Test 5: Save Draft${NC}"
DRAFT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/emails/draft" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [{"email": "recipient@example.com", "name": "Recipient"}],
    "subject": "Draft Email",
    "textBody": "This is a draft email"
  }')

DRAFT_ID=$(echo "$DRAFT_RESPONSE" | jq -r '.data._id')
echo "$DRAFT_RESPONSE" | jq '.'
echo ""

# Test 6: Send Email
echo -e "${BLUE}Test 6: Send Email${NC}"
SEND_RESPONSE=$(curl -s -X POST "$BASE_URL/api/emails/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [
      {"email": "alice@example.com", "name": "Alice"},
      {"email": "bob@example.com", "name": "Bob"}
    ],
    "cc": [{"email": "manager@example.com", "name": "Manager"}],
    "subject": "Test Email from AbsurdLabs",
    "textBody": "Hello! This is a test email from the AbsurdLabs email system.",
    "htmlBody": "<h1>Hello!</h1><p>This is a test email from the <strong>AbsurdLabs</strong> email system.</p>"
  }')

EMAIL_ID=$(echo "$SEND_RESPONSE" | jq -r '.data._id')
echo "$SEND_RESPONSE" | jq '.'
echo ""

# Test 7: Send Another Email (for threading)
echo -e "${BLUE}Test 7: Send Another Email${NC}"
SEND_RESPONSE_2=$(curl -s -X POST "$BASE_URL/api/emails/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": [{"email": "alice@example.com", "name": "Alice"}],
    "subject": "Follow-up Email",
    "textBody": "This is a follow-up email."
  }')

echo "$SEND_RESPONSE_2" | jq '.'
echo ""

# Test 8: List Emails (Sent folder)
echo -e "${BLUE}Test 8: List Emails (Sent)${NC}"
LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/api/emails?folder=sent&limit=10" \
  -H "Authorization: Bearer $TOKEN")

echo "$LIST_RESPONSE" | jq '.'
echo ""

# Test 9: Get Email Details
echo -e "${BLUE}Test 9: Get Email Details${NC}"
if [ "$EMAIL_ID" != "null" ] && [ -n "$EMAIL_ID" ]; then
  DETAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/emails/$EMAIL_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$DETAIL_RESPONSE" | jq '.'
else
  echo -e "${RED}No email ID available${NC}"
fi
echo ""

# Test 10: Update Email (Star it)
echo -e "${BLUE}Test 10: Update Email (Star)${NC}"
if [ "$EMAIL_ID" != "null" ] && [ -n "$EMAIL_ID" ]; then
  UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/emails/$EMAIL_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "isStarred": true,
      "labels": ["'"$LABEL_ID"'"]
    }')
  
  echo "$UPDATE_RESPONSE" | jq '.'
else
  echo -e "${RED}No email ID available${NC}"
fi
echo ""

# Test 11: Search Emails
echo -e "${BLUE}Test 11: Search Emails${NC}"
SEARCH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/emails/search" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test email",
    "page": 1,
    "limit": 10
  }')

echo "$SEARCH_RESPONSE" | jq '.'
echo ""

# Test 12: List Labels
echo -e "${BLUE}Test 12: List Labels${NC}"
LABELS_LIST=$(curl -s -X GET "$BASE_URL/api/labels" \
  -H "Authorization: Bearer $TOKEN")

echo "$LABELS_LIST" | jq '.'
echo ""

# Test 13: List Folders
echo -e "${BLUE}Test 13: List Folders${NC}"
FOLDERS_LIST=$(curl -s -X GET "$BASE_URL/api/folders" \
  -H "Authorization: Bearer $TOKEN")

echo "$FOLDERS_LIST" | jq '.'
echo ""

# Test 14: Delete Email (Move to Trash)
echo -e "${BLUE}Test 14: Delete Email (Move to Trash)${NC}"
if [ "$EMAIL_ID" != "null" ] && [ -n "$EMAIL_ID" ]; then
  DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/emails/$EMAIL_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$DELETE_RESPONSE" | jq '.'
else
  echo -e "${RED}No email ID available${NC}"
fi
echo ""

# Summary
echo "===================================="
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Summary:"
echo "- User registered and logged in"
echo "- Label and folder created"
echo "- Draft saved"
echo "- Emails sent"
echo "- Emails listed and retrieved"
echo "- Email updated (starred and labeled)"
echo "- Email search performed"
echo "- Email moved to trash"
echo ""
echo "Check the console output above for detailed results."
