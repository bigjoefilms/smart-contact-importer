export interface PatternAnalysis {
  isEmail: boolean;
  isPhone: boolean;
  isDate: boolean;
  isNumber: boolean;
  confidence: number;
}

export function analyzeDataPattern(values: string[]): PatternAnalysis {
  const nonEmptyValues = values.filter(v => v && v.trim() !== '');
  
  if (nonEmptyValues.length === 0) {
    return { isEmail: false, isPhone: false, isDate: false, isNumber: false, confidence: 0 };
  }

  let emailMatches = 0;
  let phoneMatches = 0;
  let dateMatches = 0;
  let numberMatches = 0;

  // Email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Phone regex patterns (various formats)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
  
  // Date regex patterns
  const dateRegex = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$|^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/;
  
  // Number regex
  const numberRegex = /^-?\d+\.?\d*$/;

  nonEmptyValues.forEach(value => {
    if (emailRegex.test(value)) emailMatches++;
    if (phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) phoneMatches++;
    if (dateRegex.test(value)) dateMatches++;
    if (numberRegex.test(value)) numberMatches++;
  });

  const total = nonEmptyValues.length;
  const emailConfidence = emailMatches / total;
  const phoneConfidence = phoneMatches / total;
  const dateConfidence = dateMatches / total;
  const numberConfidence = numberMatches / total;

  // Determine the most likely pattern
  const maxConfidence = Math.max(emailConfidence, phoneConfidence, dateConfidence, numberConfidence);
  
  return {
    isEmail: emailConfidence >= 0.8,
    isPhone: phoneConfidence >= 0.8,
    isDate: dateConfidence >= 0.8,
    isNumber: numberConfidence >= 0.8 && !emailConfidence && !phoneConfidence && !dateConfidence,
    confidence: maxConfidence
  };
}

import { CORE_FIELDS } from './firebase-service';

export function getSuggestedFieldType(header: string, patternAnalysis: PatternAnalysis): string {
  const headerLower = header.toLowerCase();
  
  // Direct header matching for core fields
  if (headerLower.includes('email') || headerLower.includes('e-mail')) {
    return 'email';
  }
  if (headerLower.includes('phone') || headerLower.includes('mobile') || headerLower.includes('tel')) {
    return 'phone';
  }
  if (headerLower.includes('first') && headerLower.includes('name')) {
    return 'firstName';
  }
  if (headerLower.includes('last') && headerLower.includes('name')) {
    return 'lastName';
  }
  if (headerLower.includes('agent') && headerLower.includes('email')) {
    return 'agentEmail';
  }
  if (headerLower.includes('assigned') && headerLower.includes('agent')) {
    return 'agentEmail';
  }
  if (headerLower.includes('agent') && patternAnalysis.isEmail) {
    return 'agentEmail';
  }
  if (headerLower.includes('created') || headerLower.includes('date')) {
    return 'createdOn';
  }

  // Pattern-based suggestions for core fields
  if (patternAnalysis.isEmail) {
    return 'email';
  }
  if (patternAnalysis.isPhone) {
    return 'phone';
  }
  if (patternAnalysis.isDate) {
    return 'createdOn';
  }

  // Return custom for non-core fields
  return 'custom';
}

export function isCoreField(fieldId: string): boolean {
  return CORE_FIELDS.includes(fieldId);
}
