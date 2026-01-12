console.log('BOOTING MERRYMAIDS AI VOICE AGENT - PHASE 3 & 4');

const express = require('express');
const cors = require('cors');
const path = require("path");
const rateLimit = require('express-rate-limit');
const twilio = require('twilio');
const schedule = require('node-schedule');

const CallStateMachine = require('./engine/CallStateMachine');
const AICallAgent = require('./engine/AICallAgent');
const { 
  ElevenLabsVoiceAgent,
  TwilioVoiceHandler,
  WhatsAppConfirmation,
  EmailConfirmation,
  ReminderScheduler,
  PLUMBING_AI_SYSTEM_PROMPT 
} = require('./engine/phase3Phase4Integration');
const PLUMBING_KB = require('./engine/plumbingKnowledgeBase');

const app = express();
app.use(express.static(path.join(__dirname, "public")));


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Initialize components
const stateMachine = new CallStateMachine();
const aiAgent = new AICallAgent();
const elevenlabs = new ElevenLabsVoiceAgent(process.env.ELEVENLABS_API_KEY);
const twilioHandler = new TwilioVoiceHandler(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
  process.env.TWILIO_PHONE_NUMBER
);
const whatsappService = new WhatsAppConfirmation(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const emailService = new EmailConfirmation(
  process.env.EMAIL_ADDRESS,
  process.env.EMAIL_PASSWORD
);
const reminderScheduler = new ReminderScheduler();

// In-memory storage
const activeCalls = new Map();
const appointments = new Map();
const plumbingContext = { kb: PLUMBING_KB, systemPrompt: PLUMBING_AI_SYSTEM_PROMPT };

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  console.log('\u2714 Health check OK');
  res.status(200).json({
    status: 'healthy',
    phase: '3&4',
    integrations: ['ElevenLabs', 'Twilio', 'WhatsApp', 'Email', 'Reminders'],
    timestamp: new Date()
  });
});

// ==================== VOICE CALL ENDPOINTS ====================

// Browser Demo - Start Call (for sales demos)
app.post('/demo/call/start', (req, res) => {
  try {
    const callState = stateMachine.initializeCall();
    activeCalls.set(callState.callId, callState);
    
    const greeting = "Thanks for calling Mr. Rooter Plumbing! We handle residential and commercial plumbing services. How can we help you today?";
    
    res.status(200).json({
      callId: callState.callId,
      response: greeting,
      state: callState.currentState,
      mode: 'demo',
      business: plumbingContext.kb.businessName
    });
  } catch (error) {
    console.error('Demo call start error:', error);
    res.status(500).json({ error: 'Failed to start demo call' });
  }
});

// Browser Demo - Process Input
app.post('/demo/call/input', (req, res) => {
  try {
    const { callId, userInput } = req.body;
    
    if (!callId || !activeCalls.has(callId)) {
      return res.status(400).json({ error: 'Invalid call ID' });
    }
    if (!userInput) {
      return res.status(400).json({ error: 'Missing user input' });
    }
    
    const callState = activeCalls.get(callId);
    const result = stateMachine.processInput(callState, userInput);
    activeCalls.set(callId, result.callState);
    
    res.status(200).json({
      callId,
      response: result.response,
      state: result.nextState,
      isValid: result.isValid,
      collectedData: result.callState.collectedData,
      isComplete: stateMachine.isCallComplete(result.callState),
      business: plumbingContext.kb.businessName
    });
  } catch (error) {
    console.error('Demo input error:', error);
    res.status(500).json({ error: 'Failed to process demo input' });
  }
});

// Browser Demo - Book Appointment
app.post('/demo/appointment/book', async (req, res) => {
  try {
    const { callId, name, phone, email, service, date, time } = req.body;
    
    const appointmentId = `APT-${Date.now()}`;
    const appointmentDetails = {
      id: appointmentId,
      name,
      phone,
      email,
      service,
      date,
      time,
      business: plumbingContext.kb.businessName,
      status: 'confirmed',
      createdAt: new Date()
    };
    
    appointments.set(appointmentId, appointmentDetails);
    
    // Send WhatsApp confirmation
    await whatsappService.sendConfirmation(phone, appointmentDetails);
    
    // Send Email confirmation
    await emailService.sendConfirmation(email, appointmentDetails);
    
    // Schedule reminders
    const appointmentDateTime = new Date(`${date} ${time}`);
    reminderScheduler.scheduleReminders(appointmentId, appointmentDateTime, phone, email);
    
    res.status(200).json({
      success: true,
      appointmentId,
      appointment: appointmentDetails,
      confirmationsSent: {
        whatsapp: 'sent to ' + phone,
        email: 'sent to ' + email
      },
      reminders: '24h and 2h before appointment'
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// ==================== TWILIO VOICE INTEGRATION ====================

app.post('/twilio/voice', (req, res) => {
  console.log('\ud83d\udcc4 Incoming Twilio call');
  twilioHandler.handleIncomingCall(req, res);
});

app.post('/twilio/voice-input', async (req, res) => {
  try {
    const digits = req.body.Digits || '';
    console.log(`\u2705 Twilio input received: ${digits}`);
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Thank you for your input. We will connect you shortly.</Say>
      </Response>`;
    
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Twilio voice input error:', error);
    res.status(500).json({ error: 'Failed to process Twilio input' });
  }
});

// ==================== WHATSAPP WEBHOOK ====================

app.post('/whatsapp/incoming', (req, res) => {
  const { Body, From } = req.body;
  console.log(`\ud83d\udcac WhatsApp from ${From}: ${Body}`);
  res.status(200).json({ received: true });
});

// ==================== APPOINTMENT MANAGEMENT ====================

app.get('/appointments/:id', (req, res) => {
  const appointment = appointments.get(req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  res.status(200).json(appointment);
});

app.get('/appointments', (req, res) => {
  res.status(200).json({
    total: appointments.size,
    appointments: Array.from(appointments.values())
  });
});

// ==================== PLUMBING CONTEXT ====================

app.get('/plumbing/info', (req, res) => {
  res.status(200).json({
    business: plumbingContext.kb,
    systemPrompt: plumbingContext.systemPrompt
  });
});

// ==================== DEMO ENDPOINTS ====================

app.get('/', (req, res) => {
  res.send(`
    <h1>MERRYMAIDS AI Voice Agent - Phase 3 & 4</h1>
    <h2>Mr. Rooter Plumbing 24/7 Appointment Scheduler</h2>
    <p>Integration Status: Active</p>
    <ul>
      <li>✓ ElevenLabs Voice Integration</li>
      <li>✓ Twilio Phone Webhooks</li>
      <li>✓ WhatsApp Confirmations</li>
      <li>✓ Email Confirmations</li>
      <li>✓ 24h + 2h Reminder Scheduling</li>
    </ul>
    <h3>API Endpoints Available:</h3>
    <pre>
    POST /demo/call/start - Start demo call
    POST /demo/call/input - Process user input
    POST /demo/appointment/book - Book appointment
    POST /twilio/voice - Handle incoming Twilio calls
    GET /appointments - List all appointments
    GET /health - Health check
    </pre>
  `);
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('\u274c Error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Voice Demo Route
app.get('/voice-demo.html', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, 'public', 'voice-demo.html');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading voice-demo.html:', err);
      res.status(404).send('Voice demo file not found');
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});


// Voice Agent API Endpoint
app.post('/api/voice-agent', async (req, res) => {
  try {
    const { userMessage, conversationContext = [] } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const messages = [
      {
        role: 'system',
        content: 'You are a professional US-based virtual receptionist. Speak clearly, be helpful, and provide accurate information about plumbing and roofing services.',
      },
      ...conversationContext,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.4,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I did not catch that.';

    res.json({ aiResponse });
  } catch (err) {
    console.error('Voice agent error:', err);
    res.status(500).json({ error: 'Failed to process voice request', details: err.message });
  }
});

// ==================== SERVER START ====================

const PORT = Number(process.env.PORT);
if (!PORT) {
  throw new Error('PORT environment variable is not set');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🚀 MERRYMAIDS AI Voice Agent - PHASE 3 & 4 DEPLOYED');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🏢 Business: ${plumbingContext.kb.businessName}`);
  console.log(`📞 Business Phone: ${plumbingContext.kb.phone}`);
  console.log(`🌐 Integrations: ElevenLabs, Twilio, WhatsApp, Email, Reminders`);
  console.log(`${'='.repeat(60)}\n`);
});