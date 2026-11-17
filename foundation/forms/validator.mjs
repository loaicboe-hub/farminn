/**
 * Master Foundation — Portable Form & Payload Validator (Zero Dependencies)
 * Shared validation rules returning standardized i18n message keys
 * across ar, en, fr, ru, de, and es.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[+\d][\d\s().-]{5,24}$/;

export function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 190 && EMAIL_REGEX.test(value.trim());
}

export function isValidPhone(value) {
  return typeof value === 'string' && PHONE_REGEX.test(value.trim());
}

export function isValidHttpUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate an input object against a field rules map.
 * @param {Record<string, unknown>} payload
 * @param {Record<string, {
 *   required?: boolean,
 *   type?: 'string'|'email'|'phone'|'url',
 *   minLength?: number,
 *   maxLength?: number,
 *   matchesField?: string
 * }>} schema
 * @returns {{ valid: boolean, errors: Record<string, { key: string, params?: Record<string, unknown> }> }}
 */
export function validatePayload(payload = {}, schema = {}) {
  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const raw = payload[field];
    const value = typeof raw === 'string' ? raw.trim() : raw;
    const isEmpty = value === undefined || value === null || value === '';

    if (rules.required && isEmpty) {
      errors[field] = { key: 'validation.required' };
      continue;
    }

    if (isEmpty) continue;

    const str = String(value);

    if (rules.type === 'email' && !isValidEmail(str)) {
      errors[field] = { key: 'validation.invalidEmail' };
      continue;
    }

    if (rules.type === 'phone' && !isValidPhone(str)) {
      errors[field] = { key: 'validation.invalidPhone' };
      continue;
    }

    if (rules.type === 'url' && !isValidHttpUrl(str)) {
      errors[field] = { key: 'validation.invalidUrl' };
      continue;
    }

    if (typeof rules.minLength === 'number' && str.length < rules.minLength) {
      errors[field] = { key: 'validation.minLength', params: { min: rules.minLength } };
      continue;
    }

    if (typeof rules.maxLength === 'number' && str.length > rules.maxLength) {
      errors[field] = { key: 'validation.maxLength', params: { max: rules.maxLength } };
      continue;
    }

    if (rules.matchesField && str !== String(payload[rules.matchesField] ?? '').trim()) {
      errors[field] = { key: 'validation.passwordMismatch' };
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

