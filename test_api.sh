#!/bin/bash
BASE_URL="https://ananya-voice-agent-production.up.railway.app"

echo "🧪 COMPREHENSIVE API TEST SUITE"
echo "================================"
echo ""

echo "TEST 1: POST /demo/call/start"
echo "Testing: Start a new demo call"
CALL_RESPONSE=$(curl -s -X POST "$BASE_URL/demo/call/start" \
  -H "Content-Type: application/json")
echo "✅ Response:"
echo "$CALL_RESPONSE" | jq .
CALL_ID=$(echo "$CALL_RESPONSE" | jq -r '.callId')
echo "Extracted Call ID: $CALL_ID"
echo ""

echo "TEST 2: POST /demo/call/input"
echo "Testing: Process user input 'I need a drain cleaning'"
INPUT_RESPONSE=$(curl -s -X POST "$BASE_URL/demo/call/input" \
  -H "Content-Type: application/json" \
  -d "{ \"callId\": \"$CALL_ID\", \"userInput\": \"I need a drain cleaning\" }")
echo "✅ Response:"
echo "$INPUT_RESPONSE" | jq .
echo ""

echo "TEST 3: GET /appointments"
echo "Testing: Get all appointments before booking"
APPOINTS_BEFORE=$(curl -s -X GET "$BASE_URL/appointments")
echo "✅ Response:"
echo "$APPOINTS_BEFORE" | jq .
echo ""

echo "TEST 4: POST /demo/appointment/book"
echo "Testing: Book an appointment"
BOOK_RESPONSE=$(curl -s -X POST "$BASE_URL/demo/appointment/book" \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "'$CALL_ID'",
    "name": "John Smith",
    "phone": "+1-555-123-4567",
    "email": "john@example.com",
    "service": "Drain Cleaning",
    "date": "2026-01-15",
    "time": "2:00 PM"
  }')
echo "✅ Response:"
echo "$BOOK_RESPONSE" | jq .
echo ""

echo "TEST 5: GET /appointments (after booking)"
echo "Testing: Get all appointments after booking"
APPOINTS_AFTER=$(curl -s -X GET "$BASE_URL/appointments")
echo "✅ Response:"
echo "$APPOINTS_AFTER" | jq .
echo ""

echo "✅ ALL TESTS COMPLETE!"
