# TWILIO & WHATSAPP SETUP - Step-by-Step Guide
## Quick Start: 15 Minutes to Live WhatsApp Bot

---

## QUICKEST PATH: Use Twilio WhatsApp Sandbox (FREE, 5 minutes)

### What is the Sandbox?
- Twilio provides a **free sandbox** for testing WhatsApp without a business account
- Works with up to 100 WhatsApp numbers
- Perfect for development and testing
- No costs - uses Twilio trial credits

### Step 1: Create Twilio Account (2 minutes)

**Go to:** https://www.twilio.com/try-twilio

1. Click "Sign Up"
2. Enter email, password, name
3. Verify email address
4. Verify phone number (SMS)
5. Select "SMS, Voice, Messaging"
6. Skip the questions
7. You now have $15 free credit ✓

**Save your credentials:**
```
Account SID: [Will be on dashboard]
Auth Token: [Will be on dashboard]
```

### Step 2: Access Twilio Console (1 minute)

1. Go to: https://www.twilio.com/console
2. Look for the **Account SID** and **Auth Token** (keep these safe!)
3. Copy and save them

### Step 3: Set Up WhatsApp Sandbox (2 minutes)

1. In Twilio Console, click **Messaging** in left sidebar
2. Click **Try it out**
3. Select **WhatsApp**
4. You'll see:
   ```
   Sandbox Phone Number: +1 415-523-8886
   Sandbox Name: join [xxxxx]
   ```

### Step 4: Join the Sandbox (1 minute)

1. Open WhatsApp on your phone
2. Send this message to +1 415-523-8886:
   ```
   join carbon-tulip
   ```
   (Replace "carbon-tulip" with your actual sandbox name)

3. Wait for response confirming you've joined
4. You're now connected to the sandbox! ✓

### Step 5: Configure Webhook URL (2 minutes)

1. Back in Twilio Console > Messaging > WhatsApp
2. Under "Sandbox Configuration"
3. Find "WHEN A MESSAGE COMES IN"
4. Set URL to:
   ```
   https://ananya-voice-agent-production.up.railway.app/webhook/twilio-whatsapp
   ```
5. Method: **POST**
6. Save

### Step 6: Update Railway Variables (2 minutes)

1. Go to https://railway.app
2. Select "successful-harmony" project
3. Click "ananya-voice-agent-production" service
4. Go to **Variables** tab
5. Add/update:

```
TWILIO_ACCOUNT_SID=[Your Account SID]
TWILIO_AUTH_TOKEN=[Your Auth Token]
TWILIO_PHONE_NUMBER=+14155238886
TWILIO_WHATSAPP_NUMBER=+14155238886
```

6. Service auto-redeploys (wait 1-2 minutes for green checkmark)

### Step 7: Test It! (1 minute)

1. Open WhatsApp on your phone
2. Find the sandbox chat (+1 415-523-8886)
3. Send:
   ```
   Hello, I need plumbing help
   ```
4. Bot should respond within 5 seconds ✓
5. You'll get an appointment confirmation ✓

---

## PRODUCTION PATH: Get Your Own WhatsApp Number (24-48 hours)

For a professional setup with your own business number:

### Phase 1: WhatsApp Business Account (Day 1)

1. **Create Meta Business Account:**
   - Go to https://business.facebook.com
   - Select "Create Account"
   - Enter business details
   - Verify email

2. **Register Phone Number:**
   - Go to https://developers.facebook.com/docs/whatsapp
   - Click "Get Started"
   - Click "Create Phone Number ID"
   - Choose your country and area code
   - Verify with SMS code

3. **Get WhatsApp API Credentials:**
   - Go to https://developers.facebook.com/apps
   - Create new app (type: Business)
   - Add WhatsApp product
   - Get:
     ```
     Phone Number ID: XXXXXXXXX
     Business Account ID: XXXXXXXXX
     ```

### Phase 2: Twilio WhatsApp Connector (Day 2)

1. **Link Your Number to Twilio:**
   - Go to Twilio Console > Messaging > WhatsApp
   - Click "Connect your number"
   - Select "Meta/Facebook"
   - Authenticate with Meta account
   - Select your WhatsApp number
   - Twilio will verify the connection

2. **Update Twilio Variables:**
   - Get new Twilio phone number: +1XXXXXXXXXX
   - Update in Railway:
     ```
     TWILIO_PHONE_NUMBER=+1XXXXXXXXXX (your new number)
     TWILIO_WHATSAPP_NUMBER=+1XXXXXXXXXX
     ```

### Phase 3: Business Verification (Day 3)

1. **Submit for Approval:**
   - Meta requires business verification
   - Go to Business Manager > Settings > Security
   - Verify business with government ID
   - Add business documentation

2. **Wait for Approval:**
   - Usually takes 24-48 hours
   - You'll get email when approved
   - Your WhatsApp number becomes active

---

## TESTING YOUR SETUP

### Test 1: Simple Text Message
```
Send to bot: "Hello"
Expected: Bot greeting response
```

### Test 2: Plumbing Request
```
Send to bot: "I have a leaky faucet"
Expected: Bot asks for name, phone, time preference
```

### Test 3: Full Appointment
```
Send to bot: 
"My name is John Smith, my phone is 555-1234, I need help tomorrow at 2pm"

Expected:
- Confirmation message
- Email sent to admin
- Voice message played
- Appointment in database
```

### Test 4: Check Appointment
```
GET https://ananya-voice-agent-production.up.railway.app/appointments

Expected:
JSON with all appointments created
```

---

## MONITORING & DEBUGGING

### Check Logs in Railway

1. Go to Railway Dashboard
2. Select your service
3. Click **Logs** tab
4. Look for:
   - "✓ Webhook received" - Message arrived
   - "✓ Processing appointment" - Data being saved
   - "✓ Sending email" - Confirmation sent
   - "✓ Generating voice" - Voice message created

### Common Issues & Solutions

**Issue: "Webhook URL not accessible"**
- Solution: Check Railway service is running (green checkmark)
- Solution: Verify HTTPS URL (not HTTP)
- Solution: Check firewall not blocking webhooks

**Issue: "Message received but no response"**
- Solution: Check TWILIO_ACCOUNT_SID is correct
- Solution: Check TWILIO_AUTH_TOKEN is correct
- Solution: Check Railway logs for errors
- Solution: Verify webhook URL is exactly right

**Issue: "Appointment not saving"**
- Solution: Check database connection in logs
- Solution: Check Railway PostgreSQL is running
- Solution: Verify DATABASE_URL variable

**Issue: "Email not sending"**
- Solution: Check Gmail app-specific password
- Solution: Verify SMTP variables are set
- Solution: Check "Less secure apps" is enabled
- Solution: Verify admin email address

**Issue: "Voice message not playing"**
- Solution: Check ElevenLabs API key is correct
- Solution: Check account has API credits
- Solution: Check ELEVENLABS_VOICE_ID is valid
- Solution: Check error logs in Railway

---

## COSTS BREAKDOWN

### Free Tier (Sandbox)
- Twilio: $15 free credit (can test for weeks)
- ElevenLabs: Free tier (10,000 characters/month)
- OpenAI: $5 free credit
- **Total: $0**

### Production Tier (Your Own Number)
- Twilio: ~$0.01 per message + $1/month for number
- ElevenLabs: ~$0.30 per 1000 characters
- OpenAI: ~$0.002 per 1000 tokens
- Email: Free (Gmail)
- Railway: Free tier (up to 100k requests/month)
- **Total: ~$50-100/month at scale**

---

## QUICK COMMANDS

### Test in Terminal
```bash
# Check if server is running
curl https://ananya-voice-agent-production.up.railway.app/health

# Create appointment via curl
curl -X POST https://ananya-voice-agent-production.up.railway.app/appointment/create \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "John", "phone": "+15551234567", "issue": "Leak"}'

# Get all appointments
curl https://ananya-voice-agent-production.up.railway.app/appointments | jq

# Check server logs
railway logs  # if using Railway CLI
```

---

## SUCCESS CHECKLIST

- [ ] Twilio account created
- [ ] WhatsApp sandbox joined
- [ ] Webhook URL configured in Twilio
- [ ] Railway variables updated
- [ ] Service redeployed (green)
- [ ] Test message sent
- [ ] Bot responds
- [ ] Appointment created
- [ ] Email received
- [ ] Voice played
- [ ] All endpoints tested
- [ ] No errors in logs
- [ ] Ready for production!

---

## NEED HELP?

**Twilio Docs:** https://www.twilio.com/docs/whatsapp
**WhatsApp API:** https://developers.facebook.com/docs/whatsapp/api/messages
**ElevenLabs:** https://docs.elevenlabs.io/api-reference
**Railway Docs:** https://docs.railway.app/

