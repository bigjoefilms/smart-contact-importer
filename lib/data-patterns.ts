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
  const headerLower = header.toLowerCase().trim();
  
  // Enhanced field matching with fuzzy logic
  const fieldMappings = [
    // First Name variations
    { patterns: ['first name', 'firstname', 'given name', 'forename', 'customer name', 'client name', 'contact name'], field: 'firstName' },
    { patterns: ['fname', 'first'], field: 'firstName' },
    
    // Last Name variations
    { patterns: ['last name', 'lastname', 'surname', 'family name'], field: 'lastName' },
    { patterns: ['lname', 'last'], field: 'lastName' },
    
    // Email variations
    { patterns: ['email', 'e-mail', 'email address', 'contact email', 'customer email'], field: 'email' },
    { patterns: ['mail', 'electronic mail'], field: 'email' },
    
    // Phone variations
    { patterns: ['phone', 'telephone', 'mobile', 'cell', 'contact number', 'phone number'], field: 'phone' },
    { patterns: ['tel', 'mobile number', 'cell phone'], field: 'phone' },
    
    // Agent variations
    { patterns: ['agent email', 'assigned agent', 'sales agent', 'account manager'], field: 'agentEmail' },
    { patterns: ['agent'], field: patternAnalysis.isEmail ? 'agentEmail' : 'custom' },
    
    // Date variations
    { patterns: ['created', 'created date', 'created on', 'date created', 'import date'], field: 'createdOn' },
    { patterns: ['date', 'timestamp'], field: patternAnalysis.isDate ? 'createdOn' : 'custom' },
  ];
  
  // Check for exact matches first
  for (const mapping of fieldMappings) {
    for (const pattern of mapping.patterns) {
      if (headerLower === pattern || headerLower.includes(pattern)) {
        return mapping.field;
      }
    }
  }
  
  // Check for partial matches with higher confidence
  for (const mapping of fieldMappings) {
    for (const pattern of mapping.patterns) {
      const words = pattern.split(' ');
      const headerWords = headerLower.split(' ');
      
      // If most words match, suggest the field
      const matchingWords = words.filter(word => 
        headerWords.some(headerWord => 
          headerWord.includes(word) || word.includes(headerWord)
        )
      );
      
      if (matchingWords.length >= words.length * 0.6) { // 60% word match
        return mapping.field;
      }
    }
  }
  
  // Pattern-based suggestions for core fields (fallback)
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
