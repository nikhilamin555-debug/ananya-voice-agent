# PRODUCTION SETUP GUIDE - Ananya Voice Agent
## Complete Setup for WhatsApp/Twilio Integration

Your AI voice agent system is **LIVE and TESTED** at:
**https://ananya-voice-agent-production.up.railway.app**

This guide walks you through setting up real WhatsApp integration for production use.

---

## STEP 1: Set up Twilio Account & WhatsApp Integration

### 1.1 Create Twilio Account
1. Go to https://www.twilio.com/console/phone-numbers/incoming
2. Sign up for a free account (comes with $15 credit)
3. Verify your phone number
4. Get your credentials:
   - **Account SID**: Found in Twilio Console
   - **Auth Token**: Found in Twilio Console
   - **Phone Number**: Purchase a Twilio number (or use WhatsApp Sandbox initially)

### 1.2 Enable WhatsApp on Twilio
1. In Twilio Console, go to **Messaging > WhatsApp**
2. Click **Get Started**
3. **OPTION A (Sandbox - Free Testing):**
   - Use Twilio WhatsApp Sandbox
   - Join sandbox: Message "join [your sandbox code]" to +1 415-523-8886
   - This gives you a test phone number
   
4. **OPTION B (Production - Own Number):**
   - Apply for WhatsApp Business Account
   - Link your business phone number
   - Get approved (24-48 hours)
   - Note: Requires business verification

### 1.3 Configure Webhooks
1. In Twilio Console > WhatsApp Sandbox
2. Find "WHEN A MESSAGE COMES IN" field
3. Set URL to: `https://ananya-voice-agent-production.up.railway.app/webhook/twilio-whatsapp`
4. Method: POST
5. **IMPORTANT**: This must be your HTTPS Railway URL

---

## STEP 2: Update Railway Environment Variables

### 2.1 Access Railway Dashboard
1. Go to https://railway.app
2. Select your "successful-harmony" project
3. Click on the "ananya-voice-agent-production" service
4. Go to **Variables** tab

### 2.2 Add/Update These Variables
```
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX  (your Twilio WhatsApp number)
TWILIO_WHATSAPP_NUMBER=+1XXXXXXXXXX  (same as above for WhatsApp)

ELEVENLABS_API_KEY=your_elevenlabs_key_here
ELEVENLABS_VOICE_ID=your_chosen_voice_id

CLAUDE_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_key_here

SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

ADMIN_EMAIL=your_admin_email@example.com
LOG_LEVEL=info
```

### 2.3 Redeploy Service
1. After updating variables, Railway auto-redeploys
2. Wait for green checkmark next to service name
3. This takes 1-2 minutes

---

## STEP 3: Get API Keys Required

### ElevenLabs (Voice Synthesis)
1. Go to https://elevenlabs.io
2. Sign up for free account
3. Go to **API Key** section
4. Copy your API Key
5. Choose a voice ID (default: "21m00Tcm4TlvDq8ikWAM")

### OpenAI (Fallback AI)
1. Go to https://platform.openai.com/api/keys
2. Create new API key
3. Copy and save securely

### Claude (Optional Alternative)
1. Go to https://console.anthropic.com
2. Create API key
3. Copy and save securely

### Gmail (Email Notifications)
1. Enable 2-Factor Authentication on Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Generate app-specific password
4. Use this password in SMTP_PASSWORD variable

---

## STEP 4: Test WhatsApp Integration

### 4.1 Send Test Message
1. Send message to your Twilio WhatsApp number:
   ```
   {"action": "plumbing_inquiry", "customer_name": "John", "phone": "+1234567890", "issue": "Leaky faucet"}
   ```

### 4.2 Expected Response
- Bot responds with appointment availability
- Voice message is generated and sent
- Appointment data is stored
- Confirmation email sent to admin

### 4.3 Check Logs in Railway
1. Go to Railway Dashboard
2. Select service
3. Click **Logs** tab
4. Look for:
   - "Webhook received"
   - "Processing appointment"
   - "Email sent to"

---

## STEP 5: Testing All Endpoints

### Test Endpoint 1: Create Appointment
```bash
curl -X POST https://ananya-voice-agent-production.up.railway.app/appointment/create \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "John Smith", "phone": "+1234567890", "issue": "Leaky faucet", "preferred_time": "2024-01-20 10:00 AM"}'
```

### Test Endpoint 2: Get Business Info
```bash
curl https://ananya-voice-agent-production.up.railway.app/plumbing/info
```

### Test Endpoint 3: Get All Appointments
```bash
curl https://ananya-voice-agent-production.up.railway.app/appointments
```

### Test Endpoint 4: WhatsApp Webhook
```bash
curl -X POST https://ananya-voice-agent-production.up.railway.app/webhook/twilio-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"From": "whatsapp:+1234567890", "Body": "I need plumbing help"}'
```

---

## STEP 6: Production Best Practices

### 6.1 Monitoring
- Check Railway logs daily for errors
- Set up email alerts for failures
- Monitor database size
- Track API usage (ElevenLabs, OpenAI)

### 6.2 Maintenance
- Backup appointments database weekly
- Rotate API keys quarterly
- Update dependencies monthly
- Test WhatsApp webhook monthly

### 6.3 Scaling
- Current setup supports ~100 concurrent users
- Add rate limiting if needed
- Consider database migration if >10k appointments
- Load test with Apache Bench or k6

### 6.4 Security
- Never commit API keys to Git
- Use Railway's secret management
- Enable HTTPS only (default on Railway)
- Validate all webhook signatures
- Sanitize user input

---

## STEP 7: Troubleshooting

### Issue: WhatsApp messages not received
- Check webhook URL in Twilio console
- Verify Railway service is running (green checkmark)
- Check logs for 404 errors
- Ensure Twilio number is correctly configured

### Issue: Voice not generating
- Verify ElevenLabs API key is correct
- Check API key isn't expired
- Check account has API credits
- Look for rate limiting errors in logs

### Issue: Emails not sending
- Verify Gmail app-specific password
- Check SMTP variables are set
- Verify admin email address
- Check Gmail allows less secure apps

### Issue: Appointments not saving
- Check database connection in logs
- Verify Railway PostgreSQL is running
- Check disk space
- Review database error logs

---

## STEP 8: Using with Real Plumbing Business

### Option A: Use Existing Website Data
1. Update `plumbingKnowledgeBase.js` with real business data
2. Add your business hours
3. Add your actual service areas
4. Update pricing
5. Redeploy to Railway

### Option B: Web Scraping
1. Scrape competitor websites for pricing
2. Extract service areas
3. Get customer reviews
4. Update knowledge base
5. Test with sample customers

### Option C: Manual Entry
1. Create Google Sheet with business data
2. Export as JSON
3. Import to knowledge base
4. Update weekly

---

## Quick Reference: API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|----------|
| `/appointment/create` | POST | Create new appointment |
| `/appointments` | GET | List all appointments |
| `/plumbing/info` | GET | Get business info |
| `/call/initiate` | POST | Start voice call |
| `/webhook/twilio-whatsapp` | POST | WhatsApp messages |
| `/health` | GET | System health check |

---

## Final Checklist Before Going Live

- [ ] Twilio account created and verified
- [ ] WhatsApp number configured
- [ ] Webhook URL set in Twilio
- [ ] All API keys added to Railway
- [ ] Service redeployed (green checkmark)
- [ ] Test message sent via WhatsApp
- [ ] Appointment created successfully
- [ ] Email received at admin address
- [ ] Voice message played correctly
- [ ] All endpoints tested
- [ ] Logs showing no errors
- [ ] Business data updated
- [ ] Monitoring set up
- [ ] Backup plan documented

You're ready for production! 🚀
