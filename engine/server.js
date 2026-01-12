const express = require('express');
const AICallAgent = require('./engine/AICallAgent');
const { MR_ROOTER_PROFILE } = require('./engine/mrRooterProfile');
const CallStateMachine = require('./engine/CallStateMachine');
const elevenLabsService = require('./engine/elevenLabsService');
const plumbingKnowledgeBase = require('./engine/plumbingKnowledgeBase');
const validators = require('./engine/validators');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

let engine = null;



// ============================================
// WEB VOICE DEMO ENDPOINT
// ============================================

app.post('/api/voice/process', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Process through existing state machine
    const callResult = engine.processInput(generateCallId(), text);
    
    // Generate next state response
    let response = getStateResponse(callResult.state, callResult.collectedData);
    
    // Send response
    res.json({
      response: response,
      lead: callResult.collectedData,
      state: callResult.state,
      appointmentBooked: callResult.state === 'END_CALL'
    });
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ error: 'Failed to process voice input' });
  }
});

function generateCallId() {
  return 'demo_' + Math.random().toString(36).substr(2, 9);
}

function getStateResponse(state, data) {
  const responses = {
    'GREETING': 'Hi there! Thanks for calling. Are you looking for a roof installation, inspection, or repair?',
    'SERVICE_TYPE': 'Got it. Let me get some information. What's your ZIP code?',
    'LOCATION': 'Thanks. What type of roof do you currently have - shingles, metal, flat, or something else?',
    'ROOF_TYPE': 'Perfect. When are you looking to get this done - urgent, within a month, or future planning?',
    'TIMELINE': 'Great. Can I get your name and phone number so we can schedule a time?',
    'PHONE': 'Awesome. Let me confirm - you want a roof installation for your ' + (data.roofType || 'home') + ' and you\'re looking to do this ' + (data.timeline || 'soon') + '. Is that correct?',
    'CONFIRMATION': 'Perfect! I've scheduled your consultation for tomorrow at 2 PM. You'll get a confirmation on WhatsApp and email shortly. Anything else I can help with?',
    'END_CALL': 'Thank you! Your appointment is confirmed.'
  };
  return responses[state] || 'How can I help you?';
}

