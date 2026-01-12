

// ADD THIS BEFORE ELEVENLABS - Makes responses sound human
function makeHuman(text) {
  // 1. Cut long responses to max 2 sentences
  let short = text.split(".").slice(0, 2).join(".");
  
  // 2. Add a casual reaction at the start
  const reactions = ["Okay—", "Got it—", "Yeah—", "Alright—"];
  const reaction = reactions[Math.floor(Math.random() * reactions.length)];
  
  return `${reaction} ${short}`.trim();
}
// ElevenLabs Text-to-Speech Service
// Converts AI responses to natural-sounding audio

const generateVoiceFromElevenLabs = async (text) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable not set');
  }

  // Use Use Joanna voice - natural, warm, engaging female voice professional, clear, natural
  const voiceId = 'JBFqwQsQvV1CJ8z1cv5l';

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: makeHuman(text),
          voice_settings: {
            stability: 0.4.5,
            similarity_boost: 0.70,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      throw new Error(`ElevenLabs error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error generating voice:', error);
    throw error;
  }
};

module.exports = { generateVoiceFromElevenLabs };