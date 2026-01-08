# Ananya Voice Agent

## 🎙️ AI Voice Agent for Service Scheduling

Ananya is a production-ready AI voice agent that handles inbound calls for service businesses (roofing, cleaning, HVAC, etc.). It uses realistic Indian voice AI to schedule appointments, answer common questions, and confirm bookings via WhatsApp.

### Features

✅ **Realistic Voice AI** - Sounds like a real professional coordinator
✅ **Appointment Scheduling** - Automatic slot management and conflict prevention
✅ **Multi-language Support** - English and Hindi conversations
✅ **WhatsApp Confirmation** - Sends appointment details via WhatsApp
✅ **Smart Escalation** - Routes complex calls to humans
✅ **Call Reminders** - Automated reminder calls and SMS
✅ **No Code Needed** - Deploy via Railway with environment variables

## 🚀 Quick Start

### Prerequisites

- GitHub account
- OpenAI API key
- Azure Speech Services resource
- Exotel account and Indian phone number
- Railway account (for deployment)

### 1. Clone and Setup

```bash
git clone https://github.com/nikhilamin555-debug/ananya-voice-agent.git
cd ananya-voice-agent
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required keys:
- `OPENAI_API_KEY` - Your OpenAI API key
- `AZURE_SPEECH_KEY` - Azure Speech Services key
- `AZURE_SPEECH_REGION` - Region (default: centralindia)
- `EXOTEL_API_KEY` - Exotel authentication key
- `EXOTEL_SID` - Exotel SID
- `EXOTEL_TOKEN` - Exotel token
- `RAILWAY_DOMAIN` - Your Railway app URL

### 3. Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Connect your GitHub repository
4. Add environment variables in Railway dashboard
5. Deploy

## 📞 Call Flow

```
1. Customer calls Indian phone number
   ↓
2. Exotel receives call → POST webhook to Railway
   ↓
3. Ananya greets customer with realistic voice
   ↓
4. Customer speaks → Azure STT converts to text
   ↓
5. OpenAI processes conversation
   ↓
6. Azure TTS converts response to speech
   ↓
7. Exotel plays response to customer
   ↓
8. Loop continues until booking confirmed
   ↓
9. Send WhatsApp confirmation message
```

## 🛠️ Architecture

**Technology Stack:**
- **Voice**: Azure Cognitive Services (Speech-to-Text, Text-to-Speech)
- **AI**: OpenAI GPT-4 for conversation intelligence
- **Telephony**: Exotel for incoming call handling
- **Backend**: Node.js/Express running on Railway
- **Messaging**: WhatsApp Business API (future)

## 📝 System Prompt

Ananya's personality is locked for consistency:

- **Name**: Ananya (professional female operations coordinator)
- **Tone**: Calm, helpful, professional
- **Language**: Clear Indian English
- **Accent**: Neutral urban (Mumbai/Delhi/Bangalore)
- **Behavior**: Conversational, not robotic

## 🔌 API Endpoints

### Inbound Call Webhook
```
POST /exotel/inbound
```
Called when customer calls. Returns XML response with greeting audio.

### Conversation Webhook
```
POST /exotel/conversation
```
Called when customer speaks. Processes voice input and returns AI response.

### Health Check
```
GET /
```
Returns status of the agent.

## 💾 Session Management

The system maintains session state for each call:

```javascript
{
  callSid: "unique_call_id",
  callerNumber: "+91xxxxxxxxxx",
  conversationHistory: [],
  appointmentDetails: {
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    location: ""
  }
}
```

## 🔐 Security

- API keys stored in environment variables
- No sensitive data in logs
- HTTPS encryption for all API calls
- Session data cleared after call completion

## 📊 Scaling

The system can handle:
- **Max parallel calls**: 10+ (configurable)
- **Average call duration**: 2-3 minutes
- **Peak load**: Depends on Exotel and Azure quotas

## 🐛 Troubleshooting

### Azure TTS Error: "invalid type [Text] detected"
- **Solution**: Check SSML formatting in `buildSSML()` function

### OpenAI API Errors
- Verify API key is valid
- Check rate limits and quota
- Ensure model 'gpt-4' is available in your account

### Exotel Connection Issues
- Verify Exotel credentials
- Check webhook URL is accessible
- Ensure Railway app is running

## 🚧 Future Enhancements

- [ ] Voice cloning for custom brand voice
- [ ] Real-time speech transcription display
- [ ] Multi-branch support with technician routing
- [ ] Advanced analytics dashboard
- [ ] SMS reminders
- [ ] Payment integration
- [ ] Multi-language support expansion

## 📄 License

MIT

## 👤 Author

Built by Nikhil Amin

---

**Questions?** Refer to the ChatGPT conversation for detailed implementation notes.
