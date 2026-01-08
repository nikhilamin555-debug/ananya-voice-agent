console.log('BOOTING ANANYA VOICE AGENT...');

const express = require('express');
const app = express();

console.log('Express initialized');

app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  try {
    res.json({
      status: 'Ananya Voice Agent is running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in root handler:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = Number(process.env.PORT);
if (!PORT) {
  throw new Error('PORT environment variable not defined');
}
console.log('About to listen on port:', PORT);

app.listen(PORT, '0.0.0.0', () => {
  console.log('Ananya Voice Agent listening on port', PORT);
});

module.exports = app;
