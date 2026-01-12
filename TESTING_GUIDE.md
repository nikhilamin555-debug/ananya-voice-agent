# 🧪 MERRYMAIDS AI Voice Agent - COMPLETE TESTING GUIDE

## How to Test Your System

Your AI voice agent is live and ready to test. Here are 5 easy ways to test it:

---

## METHOD 1: Browser Testing (No Tools Needed) ✨

### 1.1 - Test Health Check
```
Open: https://ananya-voice-agent-production.up.railway.app/health

Expected: JSON showing "status": "healthy"
```

### 1.2 - Test Business Info
```
Open: https://ananya-voice-agent-production.up.railway.app/plumbing/info

Expected: Complete Mr. Rooter Plumbing business details + AI system prompt
```

### 1.3 - View Appointments
```
Open: https://ananya-voice-agent-production.up.railway.app/appointments

Expected: JSON showing all booked appointments
```

---

## METHOD 2: Using cURL (Command Line) 🖥️

### 2.1 - Start a Demo Call
```bash
curl -X POST https://ananya-voice-agent-production.up.railway.app/demo/call/start \
  -H "Content-Type: application/json"

Expected Response:
{
  "callId": "call-XXXXX",
  "response": "Thanks for calling Mr. Rooter Plumbing!...",
  "state": "SERVICE_TYPE",
  "business": "Mr. Rooter Plumbing"
}
```

### 2.2 - Process User Input
```bash
Save the callId from above, then:

curl -X POST https://ananya-voice-agent-production.up.railway.app/demo/call/input \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call-XXXXX",
    "userInput": "I need drain cleaning"
  }'

Expected: State advances and AI responds
```

### 2.3 - Book Appointment
```bash
curl -X POST https://ananya-voice-agent-production.up.railway.app/demo/appointment/book \
  -H "Content-Type: application/json" \
  -d '{
    "callId": "call-XXXXX",
    "name": "Your Name",
    "phone": "+1-555-123-4567",
    "email": "your@email.com",
    "service": "Drain Cleaning",
    "date": "2026-01-20",
    "time": "2:00 PM"
  }'

Expected: Appointment created with ID, confirmations sent
```

---

## METHOD 3: Using Postman (GUI) 📮

1. Download Postman: https://www.postman.com/downloads/
2. Create New Request
3. Use these endpoints:
   - POST: https://ananya-voice-agent-production.up.railway.app/demo/call/start
   - POST: https://ananya-voice-agent-production.up.railway.app/demo/call/input
   - POST: https://ananya-voice-agent-production.up.railway.app/demo/appointment/book
   - GET: https://ananya-voice-agent-production.up.railway.app/appointments

---

## METHOD 4: Using Python 🐍

```python
import requests
import json

BASE_URL = "https://ananya-voice-agent-production.up.railway.app"

# Start a call
response = requests.post(f"{BASE_URL}/demo/call/start")
data = response.json()
print(json.dumps(data, indent=2))

call_id = data['callId']

# Process input
response = requests.post(
    f"{BASE_URL}/demo/call/input",
    json={
        "callId": call_id,
        "userInput": "I need drain cleaning"
    }
)
print(json.dumps(response.json(), indent=2))

# Book appointment
response = requests.post(
    f"{BASE_URL}/demo/appointment/book",
    json={
        "callId": call_id,
        "name": "John Smith",
        "phone": "+1-555-123-4567",
        "email": "john@example.com",
        "service": "Drain Cleaning",
        "date": "2026-01-20",
        "time": "2:00 PM"
    }
)
print(json.dumps(response.json(), indent=2))
```

---

## METHOD 5: Full Flow Demo (Automated) ⚙️

A complete test script is already on your system:

```bash
./test_api.sh
```

This runs all tests automatically and shows results.

---

## What Each Test Verifies

| Test | Verifies |
|------|----------|
| /health | System is running and all integrations active |
| /demo/call/start | New calls can be initiated |
| /demo/call/input | State machine advances correctly |
| /demo/appointment/book | Appointments created, confirmations sent |
| /appointments | Data persists in database |
| /plumbing/info | Business context and AI prompt loaded |

---

## Expected Responses

### ✅ Good Response (200 OK)
```json
{
  "success": true,
  "appointmentId": "APT-XXXXX",
  "data": { /* appointment details */ }
}
```

### ❌ Error Response (400/500)
```json
{
  "error": "Error message here"
}
```

---

## Test Scenarios

### Scenario 1: Complete Call Flow
1. POST /demo/call/start
2. POST /demo/call/input (Service type)
3. POST /demo/call/input (Location/ZIP)
4. POST /demo/call/input (Phone)
5. POST /demo/call/input (Timeline)
6. POST /demo/appointment/book
7. GET /appointments (verify)

### Scenario 2: Error Handling
1. POST /demo/call/input with invalid callId → Should error
2. POST /demo/call/input with missing userInput → Should error
3. POST /demo/appointment/book with incomplete data → Should error

### Scenario 3: State Machine Validation
1. Create call
2. Try invalid input (should reprompt)
3. Try valid input (should advance)

---

## Test Data You Can Use

```json
{
  "goodPhone": "+1-555-123-4567",
  "goodZIP": "75001",
  "goodEmail": "test@example.com",
  "goodDate": "2026-01-20",
  "goodTime": "2:00 PM",
  "services": [
    "Residential Plumbing",
    "Commercial Plumbing",
    "Emergency Plumbing",
    "Drain Cleaning",
    "Sewer Line Repair",
    "Bathroom Remodeling"
  ]
}
```

---

## Real-World Testing

Once satisfied with testing, you can:

1. **Connect Twilio** - Point your Twilio webhook to `/twilio/voice`
2. **Live Calls** - Customers call your number directly
3. **WhatsApp** - Confirmations sent automatically
4. **Reminders** - Auto-scheduled 24h + 2h before

---

## Troubleshooting

### Issue: Connection Refused
**Solution**: System is running. Check URL is correct.

### Issue: 404 Not Found
**Solution**: Endpoint doesn't exist. Check URL spelling.

### Issue: 500 Internal Error
**Solution**: Data is malformed. Check JSON syntax.

### Issue: Invalid callId
**Solution**: CallId expired. Start new call with /demo/call/start

