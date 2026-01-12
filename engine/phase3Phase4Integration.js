// Phase 3 & 4 Integration
// Includes: ElevenLabs, Twilio, WhatsApp, Email, Reminders

const nodemailer = require('nodemailer'); // for email
const schedule = require('node-schedule'); // for reminders

// ============= ELEVENLABS VOICE INTEGRATION =============
class ElevenLabsVoiceAgent {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.voiceId = 'pNInz6obpgDQGcFmaJgB'; // Professional male voice
  }

  async synthesizeVoice(text) {
    if (!this.apiKey) return null; // Stub if no API key
    try {
      // Implementation would call ElevenLabs API
      // For now, return text that would be converted to speech
      return { text, ready: true };
    } catch (error) {
      console.error('ElevenLabs error:', error);
      return null;
    }
  }
}

// ============= TWILIO VOICE INTEGRATION =============
class TwilioVoiceHandler {
  constructor(accountSid, authToken, fromNumber) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  // Webhook handler for incoming Twilio calls
  handleIncomingCall(req, res) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Gather numDigits="1" action="/twilio/voice-input">
          <Say>Thanks for calling Mr. Rooter Plumbing. Press 1 for scheduling, 2 for emergency, or stay on the line for an agent.</Say>
        </Gather>
      </Response>`;
    
    res.type('text/xml');
    res.send(twiml);
  }

  // Process voice input from Twilio
  async processVoiceInput(userInput, callState) {
    // Maps DTMF input or speech to call logic
    return { command: userInput, processed: true };
  }
}

// ============= WHATSAPP CONFIRMATION =============
class WhatsAppConfirmation {
  constructor(twilioAccountSid, twilioAuthToken) {
    this.accountSid = twilioAccountSid;
    this.authToken = twilioAuthToken;
  }

  async sendConfirmation(phoneNumber, appointmentDetails) {
    const message = `
✅ Appointment Confirmed - Mr. Rooter Plumbing
📅 ${appointmentDetails.date}
⏰ ${appointmentDetails.time}
🔧 Service: ${appointmentDetails.service}
📍 Location: ${appointmentDetails.location}
Reply CONFIRM or RESCHEDULE
    `;
    
    try {
      // Would use Twilio WhatsApp API
      console.log(`WhatsApp to ${phoneNumber}: ${message}`);
      return { sent: true, phone: phoneNumber };
    } catch (error) {
      console.error('WhatsApp error:', error);
      return { sent: false };
    }
  }
}

// ============= EMAIL CONFIRMATION =============
class EmailConfirmation {
  constructor(senderEmail, senderPassword) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: senderEmail, pass: senderPassword }
    });
  }

  async sendConfirmation(clientEmail, appointmentDetails) {
    const emailTemplate = `
<h2>Appointment Confirmed - Mr. Rooter Plumbing</h2>
<p><strong>Service:</strong> ${appointmentDetails.service}</p>
<p><strong>Date:</strong> ${appointmentDetails.date}</p>
<p><strong>Time:</strong> ${appointmentDetails.time}</p>
<p><strong>Location:</strong> ${appointmentDetails.location}</p>
<p>If you need to reschedule, call us at (855) 982-2028</p>
    `;

    try {
      // Would send email via SendGrid or nodemailer
      console.log(`Email to ${clientEmail}: ${appointmentDetails.service}`);
      return { sent: true, email: clientEmail };
    } catch (error) {
      console.error('Email error:', error);
      return { sent: false };
    }
  }
}

// ============= REMINDER SCHEDULER =============
class ReminderScheduler {
  scheduleReminders(appointmentId, appointmentTime, clientPhone, clientEmail) {
    const date24hBefore = new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000);
    const date2hBefore = new Date(appointmentTime.getTime() - 2 * 60 * 60 * 1000);

    // 24-hour reminder
    schedule.scheduleJob(date24hBefore, () => {
      console.log(`24h reminder for appointment ${appointmentId}`);
      // Send WhatsApp reminder
    });

    // 2-hour reminder
    schedule.scheduleJob(date2hBefore, () => {
      console.log(`2h reminder for appointment ${appointmentId}`);
      // Send email reminder
    });
  }
}

// ============= PLUMBING AI SYSTEM PROMPT =============
const PLUMBING_AI_SYSTEM_PROMPT = `
You are Rosie, a friendly and efficient receptionist at Mr. Rooter Plumbing, a trusted plumbing and drain cleaning company. You are answering phone calls for appointment scheduling.

Your personality:
- Warm, professional, and helpful
- Knowledgeable about plumbing services
- Patient with customers
- Able to handle booking, rescheduling, and cancellations smoothly

Services offered:
1. Residential Plumbing
2. Commercial Plumbing
3. Emergency Plumbing (24/7)
4. Drain Cleaning
5. Sewer Line Repair
6. Bathroom Remodeling

Your responsibilities:
1. Greet the caller warmly
2. Identify their service needs
3. Check service availability
4. Collect appointment details: name, phone, service type, preferred date/time, location
5. Confirm all details
6. Provide confirmation number
7. Schedule reminders (24h and 2h before)

Guardrails:
- Don't make promises outside business hours (offer emergency line)
- Don't provide pricing over phone (direct to website or office)
- If unable to help, transfer to manager
- Always remain professional and courteous
- Confirm appointment details before ending call
`;

module.exports = {
  ElevenLabsVoiceAgent,
  TwilioVoiceHandler,
  WhatsAppConfirmation,
  EmailConfirmation,
  ReminderScheduler,
  PLUMBING_AI_SYSTEM_PROMPT
};
