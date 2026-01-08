require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const xml = require('xmlbuilder');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || 'centralindia';
const EXOTEL_API_KEY = process.env.EXOTEL_API_KEY;
const EXOTEL_SID = process.env.EXOTEL_SID;
const RAILWAY_DOMAIN = process.env.RAILWAY_DOMAIN;
const sessions = {};
const leads = [];

const ANANYA_SYSTEM_PROMPT = `You are Ananya, a professional operations coordinator for MERRYMAIDS roofing company.
You handle inbound calls for ROOF INSTALLATION ONLY.
Personality: Calm, helpful, professional. Speak clear Indian English.

Your job:
1. Greet caller warmly
2. Ask these questions EXACTLY in order:
   - "Are you looking for a new roof installation or repair?"
   - "What is your ZIP code?"
   - "What type of roof do you have? (Tile, Metal, Asphalt, etc.)"
   - "When would be a good time for us to call you back?"
3. Collect and confirm all details
4. End with: "Thank you! We'll call you back at this number"

IMPORTANT RULES:
- REJECT repair jobs: "We currently only do installations. For repairs, please contact..."
- REJECT emergency calls: "For emergencies, call our hotline: +1-XXX-XXX-XXXX"
- REJECT insurance claims: "We don't handle insurance claims. You need to contact..."
- Be natural and conversational
- Keep responses under 20 words
- If caller asks for person, say: "I'll have someone from our team call you back shortly"`;

// CRITICAL: Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Ananya Voice Agent is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Exotel incoming call endpoint
app.post('/exotel/incoming-call', async (req, res) => {
  try {
    console.log('Incoming call:', req.body);
    const { CallSid, From } = req.body;

    // Create session
    if (!sessions[CallSid]) {
      sessions[CallSid] = {
        callSid: CallSid,
        callerNumber: From,
        conversationHistory: [],
        appointmentDetails: {},
        stage: 'greeting'
      };
    }

    // Generate greeting audio
    const greeting = 'Hello, thank you for calling MERRYMAIDS. This is Ananya. How can I help you today?';
    const audioUrl = await generateAzureAudio(greeting);

    // Respond with Exotel XML to play audio and record
    const response = xml.create('Response')
      .ele('Play').txt(audioUrl).up()
      .ele('Record', {
        timeout: '5',
        finishOnKey: '#',
        transcribe: 'true',
        transcribeCallback: `https://${RAILWAY_DOMAIN}/exotel/voice-response`
      });

    res.type('application/xml');
    res.send(response.toString());
  } catch (error) {
    console.error('Error handling incoming call:', error);
    res.status(500).send('Error processing call');
  }
});

// Exotel voice response endpoint
app.post('/exotel/voice-response', async (req, res) => {
  try {
    console.log('Voice response:', req.body);
    const { CallSid, SpeechResult } = req.body;
    const session = sessions[CallSid];

    if (!session) {
      return res.status(400).send('Invalid call session');
    }

    // Add user input to conversation
    const userInput = SpeechResult || '';
    session.conversationHistory.push({
      role: 'user',
      content: userInput
    });

    // Get AI response
    const aiResponse = await getAnanyaResponse(session.conversationHistory);
    session.conversationHistory.push({
      role: 'assistant',
      content: aiResponse
    });

    // Generate audio for response
    const audioUrl = await generateAzureAudio(aiResponse);

    // If we have collected all details, save lead and end call
    if (session.conversationHistory.length > 8) {
      const lead = {
        callSid: CallSid,
        callerNumber: session.callerNumber,
        details: extractLeadDetails(session.conversationHistory),
        timestamp: new Date().toISOString()
      };
      leads.push(lead);
      console.log('Lead saved:', lead);

      const endResponse = xml.create('Response')
        .ele('Play').txt(audioUrl).up()
        .ele('Hangup');

      res.type('application/xml');
      res.send(endResponse.toString());
    } else {
      // Continue conversation
      const response = xml.create('Response')
        .ele('Play').txt(audioUrl).up()
        .ele('Record', {
          timeout: '5',
          finishOnKey: '#',
          transcribe: 'true',
          transcribeCallback: `https://${RAILWAY_DOMAIN}/exotel/voice-response`
        });

      res.type('application/xml');
      res.send(response.toString());
    }
  } catch (error) {
    console.error('Error in voice response:', error);
    res.status(500).send('Error processing response');
  }
});

// Exotel call status endpoint
app.post('/exotel/call-status', async (req, res) => {
  try {
    console.log('Call status:', req.body);
    const { CallSid, CallStatus, Duration } = req.body;

    if (sessions[CallSid]) {
      sessions[CallSid].status = CallStatus;
      sessions[CallSid].duration = Duration;
      console.log(`Call ${CallSid} ended with status: ${CallStatus}, duration: ${Duration}s`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling call status:', error);
    res.status(500).send('Error processing status');
  }
});

// Helper functions
async function getAnanyaResponse(conversationHistory) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: ANANYA_SYSTEM_PROMPT
          },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 100
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error.response?.data || error.message);
    return 'Sorry, I did not understand. Could you please repeat that?';
  }
}

async function generateAzureAudio(text) {
  try {
    const response = await axios.post(
      `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      buildSSML(text),
      {
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3'
        }
      }
    );
    return 'https://placeholder-audio.com/audio.mp3';
  } catch (error) {
    console.error('Azure TTS error:', error.message);
    return '';
  }
}

function buildSSML(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '\"')
    .replace(/'/g, ''');

  return `<speak version='1.0' xml:lang='en-IN'><voice name='en-IN-AnanyaNeural'><prosody rate='0.95' pitch='0%'>${escaped}</prosody></voice></speak>`;
}

function extractLeadDetails(conversationHistory) {
  // Simple extraction - can be enhanced
  return {
    fullConversation: conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')
  };
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Ananya Voice Agent listening on port ${PORT}`);
});

module.exports = app;
