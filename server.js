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

// Store active sessions
const sessions = {};

// Ananya system prompt for roofing service
const ANANYA_SYSTEM_PROMPT = `You are Ananya, a professional operations coordinator for a roofing company called MERRYMAIDS. You are handling inbound installation service calls.

Your personality: Calm, helpful, professional. You speak clear Indian English with professional tone.

Your job is to:
1. Greet the caller warmly
2. Identify the reason for their call (roof inspection, installation, repair, etc.)
3. Ask exactly 3 questions:
   - What is the specific issue/service needed?
   - When would they like to schedule?
   - What is their address/location?
4. Offer 2 specific time slots between 9am-6pm (1 hour appointments)
5. Confirm the booking
6. Send WhatsApp confirmation after the call

IMPORTANT: 
- Be conversational, not robotic
- If caller asks to speak with a person, escalate
- If caller seems angry, be extra sympathetic
- Never discuss contracts or legal matters
- Keep responses concise and natural
- Manage max 3 jobs per technician per day with 1 hour buffer between appointments`;

// Handle Exotel inbound webhook
app.post('/exotel/inbound', async (req, res) => {
  try {
    const { CallSid, From, CallType } = req.body;
    
    // Initialize session
    if (!sessions[CallSid]) {
      sessions[CallSid] = {
        callSid: CallSid,
        callerNumber: From,
        conversationHistory: [],
        appointmentDetails: {}
      };
    }

    // First response - Greeting
    const greeting = 'Hello, thank you for calling MERRYMAIDS. This is Ananya. How can I help you today?';
    
    // Generate audio using Azure TTS
    const audioUrl = await generateAzureAudio(greeting);
    
    // Build Exotel XML response
    const response = xml.create('Response')
      .ele('Dial', { timeout: '30' })
        .ele('Number', { statusCallbackUrl: `https://${process.env.RAILWAY_DOMAIN}/exotel/status` })
        .txt(From)
      .up()
      .up()
      .ele('Play')
        .txt(audioUrl);
    
    res.type('application/xml');
    res.send(response.toString());
    
  } catch (error) {
    console.error('Error handling inbound call:', error);
    res.status(500).send('Error processing call');
  }
});

// Handle conversation webhook
app.post('/exotel/conversation', async (req, res) => {
  try {
    const { CallSid, SpeechResult, Digits } = req.body;
    const session = sessions[CallSid];
    
    if (!session) {
      return res.status(400).send('Invalid call session');
    }

    let userInput = SpeechResult || Digits || '';
    
    // Add to conversation history
    session.conversationHistory.push({
      role: 'user',
      content: userInput
    });

    // Get response from OpenAI
    const aiResponse = await getAnanyaResponse(session.conversationHistory);
    
    // Add AI response to history
    session.conversationHistory.push({
      role: 'assistant',
      content: aiResponse
    });

    // Generate audio
    const audioUrl = await generateAzureAudio(aiResponse);
    
    // Send response
    const response = xml.create('Response')
      .ele('Play').txt(audioUrl).up()
      .ele('Record', {
        timeout: '5',
        finishOnKey: '#',
        transcribe: 'true',
        transcribeCallback: `https://${process.env.RAILWAY_DOMAIN}/exotel/conversation`
      });
    
    res.type('application/xml');
    res.send(response.toString());
    
  } catch (error) {
    console.error('Error in conversation:', error);
    res.status(500).send('Error processing conversation');
  }
});

// Get response from OpenAI
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
        max_tokens: 150
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
    return 'Sorry, I am having trouble understanding. Could you please repeat that?';
  }
}

// Generate audio using Azure Speech Services
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

    // For now, return placeholder
    // In production, upload to cloud storage and return URL
    return 'https://placeholder-audio.com/audio.mp3';
  } catch (error) {
    console.error('Azure TTS error:', error.message);
    return '';
  }
}

// Build SSML for Azure Speech
function buildSSML(text) {
  return `<speak version='1.0' xml:lang='en-IN'>
    <voice name='en-IN-AnanyaNeural'>
      <prosody rate='0.95' pitch='0%'>
        ${escapeXml(text)}
      </prosody>
    </voice>
  </speak>`;
}

// Escape XML special characters
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, char => {
    switch (char) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Ananya Voice Agent is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Ananya Voice Agent listening on port ${PORT}`);
});

module.exports = app;
