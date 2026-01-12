// AICallAgent.js - AI integration for call phrasing and clarification
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'stub';

class AICallAgent {
  constructor() {
    this.provider = 'openai'; // Can be swapped for other providers
    this.model = 'gpt-4o-mini';
  }

  async phraseResponse(baseResponse, context = {}) {
    // For now, return the base response as-is
    // Later: Send to OpenAI to rephrase naturally
    if (OPENAI_API_KEY === 'stub' || !OPENAI_API_KEY) {
      return baseResponse;
    }

    try {
      // Placeholder for OpenAI call
      // const response = await openai.chat.completions.create({
      //   model: this.model,
      //   messages: [{role: 'user', content: `Rephrase this naturally: ${baseResponse}`}]
      // });
      // return response.choices[0].message.content;
      return baseResponse;
    } catch (error) {
      console.error('AI phrasing error:', error);
      return baseResponse;
    }
  }

  async clarifyInput(userInput, expectedType) {
    // For now, return null (no clarification needed)
    // Later: Use AI to understand unclear inputs
    return null;
  }

  async extractIntent(userInput) {
    // For now, return raw input
    // Later: Use AI for advanced intent extraction
    return userInput;
  }
}

module.exports = AICallAgent;