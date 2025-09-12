
import { CORE_FIELDS } from './firebase-service';

// Use core fields from firebase service
const systemFields = CORE_FIELDS;

export interface AIMappingResult {
  [header: string]: string;
}

export interface EnhancedMappingResult {
  [header: string]: string;
}

export async function suggestMapping(headers: string[], sampleData?: Record<string, string[]>): Promise<AIMappingResult> {
  try {
    const response = await fetch('/api/ai-mapping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ headers, sampleData }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get AI mapping: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.mapping;
  } catch (error) {
    console.error("AI mapping error:", error);
    // Fallback: try basic pattern matching when AI fails
    const fallback: AIMappingResult = {};
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      // Basic pattern matching for core fields
      if (lowerHeader.includes('first') || lowerHeader.includes('given') || lowerHeader.includes('fname')) {
        fallback[header] = "firstName";
      } else if (lowerHeader.includes('last') || lowerHeader.includes('surname') || lowerHeader.includes('family') || lowerHeader.includes('lname')) {
        fallback[header] = "lastName";
      } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile') || lowerHeader.includes('tel')) {
        fallback[header] = "phone";
      } else if (lowerHeader.includes('email') || lowerHeader.includes('e-mail')) {
        fallback[header] = "email";
      } else if (lowerHeader.includes('agent') || lowerHeader.includes('rep') || lowerHeader.includes('manager')) {
        fallback[header] = "agentUid";
      } else if (lowerHeader.includes('created') || lowerHeader.includes('date') || lowerHeader.includes('timestamp')) {
        fallback[header] = "createdOn";
      } else {
        fallback[header] = "custom";
      }
    });
    return fallback;
  }
}

export function getSystemFields(): string[] {
  return [...systemFields];
}


