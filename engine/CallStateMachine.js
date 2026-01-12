// CallStateMachine.js - Core state machine for roofing call handling
const { isValidZip, isValidPhone, isValidServiceType } = require('./validators');

class CallStateMachine {
  constructor() {
    this.states = {
      GREETING: 'GREETING',
      SERVICE_TYPE: 'SERVICE_TYPE',
      LOCATION: 'LOCATION',
      PHONE: 'PHONE',
      TIMELINE: 'TIMELINE',
      CONFIRMATION: 'CONFIRMATION',
      END_CALL: 'END_CALL'
    };
  }

  initializeCall() {
    return {
      callId: `call-${Date.now()}`,
      currentState: this.states.GREETING,
      collectedData: {
        serviceType: null,
        location: null,
        phone: null,
        timeline: null
      },
      attempts: {},
      createdAt: new Date()
    };
  }

  processInput(callState, userInput) {
    const state = callState.currentState;
    const input = userInput.toLowerCase().trim();
    let response = '';
    let nextState = state;
    let isValid = false;

    switch (state) {
      case this.states.GREETING:
        response = "Thanks for calling! Are you looking for a roof installation or repair?";
        nextState = this.states.SERVICE_TYPE;
        break;

      case this.states.SERVICE_TYPE:
        if (isValidServiceType(input)) {
          callState.collectedData.serviceType = input.includes('install') ? 'installation' : 'repair';
          response = `Got it - ${callState.collectedData.serviceType}. What's your ZIP code?`;
          nextState = this.states.LOCATION;
          isValid = true;
        } else {
          response = "We handle roof installations. Are you looking for installation or something else?";
          nextState = this.states.SERVICE_TYPE;
        }
        break;

      case this.states.LOCATION:
        if (isValidZip(input)) {
          callState.collectedData.location = input;
          response = "Perfect. What type of roof do you have - shingle, metal, or tile?";
          nextState = this.states.PHONE;
          isValid = true;
        } else {
          response = "I need a valid ZIP code. Can you provide that?";
          nextState = this.states.LOCATION;
        }
        break;

      case this.states.PHONE:
        if (isValidPhone(input)) {
          callState.collectedData.phone = input;
          response = "Got it! When are you looking to get this done - this week, next month, or later?";
          nextState = this.states.TIMELINE;
          isValid = true;
        } else {
          response = "I need a valid phone number. Can you provide that?";
          nextState = this.states.PHONE;
        }
        break;

      case this.states.TIMELINE:
        if (input.match(/(this week|urgent|asap|today|tomorrow|next week|1-2 weeks|1-4 weeks|month|later)/)) {
          callState.collectedData.timeline = input;
          response = `Perfect! I've got your information. We'll schedule a consultation for ${callState.collectedData.timeline} and you'll get confirmation details shortly.`;
          nextState = this.states.CONFIRMATION;
          isValid = true;
        } else {
          response = "When are you looking to move forward - soon, next month, or later?";
          nextState = this.states.TIMELINE;
        }
        break;

      case this.states.CONFIRMATION:
        response = "Thank you for your time! Our team will be in touch shortly. Have a great day!";
        nextState = this.states.END_CALL;
        isValid = true;
        break;

      case this.states.END_CALL:
        response = "Call ended.";
        break;
    }

    callState.currentState = nextState;
    return {
      response,
      callState,
      isValid,
      nextState
    };
  }

  getCollectedData(callState) {
    return callState.collectedData;
  }

  isCallComplete(callState) {
    return callState.currentState === this.states.END_CALL;
  }
}

module.exports = CallStateMachine;