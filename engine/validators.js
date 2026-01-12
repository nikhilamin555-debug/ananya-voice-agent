// validators.js - Validation functions for roofing calls

function isValidZip(input) {
  // US ZIP code validation (5 digits or 5+4 format)
  const zipPattern = /^\d{5}(-\d{4})?$/;
  return zipPattern.test(input.replace(/\D/g, '').substring(0, 5));
}

function isValidPhone(input) {
  // US phone number validation
  const phonePattern = /^\+?1?[-\s.]?(\([0-9]{3}\)|[0-9]{3})[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/;
  return phonePattern.test(input);
}

function isValidServiceType(input) {
  // Check if it's installation-related
  return input.includes('install') || input.includes('new roof') || input.includes('installation');
}

function normalizePhone(phone) {
  // Extract just the digits
  return phone.replace(/\D/g, '').substring(phone.startsWith('+1') ? 1 : 0);
}

function normalizeZip(zip) {
  // Extract just the digits
  return zip.replace(/\D/g, '').substring(0, 5);
}

module.exports = {
  isValidZip,
  isValidPhone,
  isValidServiceType,
  normalizePhone,
  normalizeZip
};