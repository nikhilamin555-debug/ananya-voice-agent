console.log('BOOTING ANANYA VOICE AGENT...');

const express = require('express');
const app = express();

const CallStateMachine = require('./engine/CallStateMachine');
const AICallAgent = require('./engine/AICallAgent');

console.log('Express initialized');

// Middleware
app.use(express.json());

// Initialize engine components
const stateMachine = new CallStateMachine();
const aiAgent = new AICallAgent();

// Store active calls in memory
const activeCalls = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).send('OK');
});

// Start a new call
app.post('/call/start', (req, res) => {
  try {
    const callState = stateMachine.initializeCall();
    activeCalls.set(callState.callId, callState);
    res.status(200).json({
      callId: callState.callId,
      response: 'Thanks for calling! Are you looking for a roof installation or repair?',
      state: callState.currentState
    });
  } catch (error) {
    console.error('Error starting call:', error);
    res.status(500).json({ error: 'Failed to start call' });
  }
});

// Process user input
app.post('/call/input', (req, res) => {
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
      isComplete: stateMachine.isCallComplete(result.callState)
    });
  } catch (error) {
    console.error('Error processing input:', error);
    res.status(500).json({ error: 'Failed to process input' });
  }
});

// End a call
app.post('/call/end', (req, res) => {
  try {
    const { callId } = req.body;
    if (!callId || !activeCalls.has(callId)) {
      return res.status(400).json({ error: 'Invalid call ID' });
    }
    const callState = activeCalls.get(callId);
    const collectedData = stateMachine.getCollectedData(callState);
    activeCalls.delete(callId);
    res.status(200).json({
      callId,
      status: 'completed',
      collectedData
    });
  } catch (error) {
    console.error('Error ending call:', error);
    res.status(500).json({ error: 'Failed to end call' });
  }
});

app.get('/', (req, res) => {
  res.send('MERRYMAIDS Voice Agent - Phase 2 Backend');
});

const PORT = Number(process.env.PORT);
if (!PORT) {
  throw new Error('PORT environment variable is not set');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});