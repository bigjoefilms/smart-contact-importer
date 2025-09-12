import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { analyzeDataPattern} from '../../../lib/data-patterns';
import { CORE_FIELDS, FIELD_LABELS } from '../../../lib/firebase-service';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Use core fields from firebase service
const systemFields = CORE_FIELDS;

export async function POST(request: NextRequest) {
  let headers: string[] = [];
  
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    headers = body.headers;
    const sampleData = body.sampleData || {};
    
    if (!headers || !Array.isArray(headers)) {
      console.error('Invalid headers provided:', headers);
      return NextResponse.json({ error: 'Invalid headers provided' }, { status: 400 });
    }

    // Analyze data patterns for each header
    const patternAnalysis: Record<string, { isEmail: boolean; isPhone: boolean; isDate: boolean; isNumber: boolean; confidence: number }> = {};
    headers.forEach(header => {
      if (sampleData[header]) {
        patternAnalysis[header] = analyzeDataPattern(sampleData[header]);
      }
    });

    // Create enhanced prompt with pattern analysis
    const patternInfo = Object.entries(patternAnalysis).map(([header, analysis]) => 
      `${header}: ${analysis.isEmail ? 'Email pattern detected' : ''}${analysis.isPhone ? 'Phone pattern detected' : ''}${analysis.isDate ? 'Date pattern detected' : ''}${analysis.isNumber ? 'Number pattern detected' : ''} (confidence: ${Math.round(analysis.confidence * 100)}%)`
    ).join('\n');

    // Create field mapping for better AI understanding
    const fieldMapping = systemFields.map((field: string) => `${field} (${FIELD_LABELS[field as keyof typeof FIELD_LABELS]})`).join(", ");

    const prompt = `
You are helping me convert spreadsheet data (XLSX/CSV) to JSON by mapping spreadsheet columns to the correct system fields for a contact management system.

Available system fields with their labels:
${fieldMapping}

Given these spreadsheet column headers: ${headers.join(", ")}.

Data pattern analysis:
${patternInfo}

For each header, determine which system field it should map to, or mark it as "custom" if it doesn't match any system field.

Consider both the header name similarity AND the data patterns detected above.

Field mapping guidelines:
- firstName: First names, given names
- lastName: Last names, surnames, family names
- phone: Phone numbers, mobile numbers, telephone numbers
- email: Email addresses, email IDs
- agentUid: Assigned agents, sales reps, account managers (will be mapped to user IDs)
- createdOn: Creation dates, created dates, date created, timestamp

Return ONLY a valid JSON object where:
- Keys are the original header names
- Values are the best matching system field name, or "custom" if no match

Example response:
{"Mobile Number": "phone", "First Name": "firstName", "Last Name": "lastName", "Agent Email": "agentUid", "Birthday": "custom"}

Make sure the JSON is valid and properly formatted.`;

    console.log('Calling OpenAI with prompt:', prompt);
    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const content = resp.choices[0].message?.content ?? "{}";
    console.log('OpenAI response:', content);
    const mapping = JSON.parse(content);
    console.log('Parsed mapping:', mapping);

    return NextResponse.json({ mapping });
  } catch (error) {
    console.error("AI mapping error:", error);
    
    // Fallback: try basic pattern matching when AI fails
    const fallback: Record<string, string> = {};
    if (headers && headers.length > 0) {
      headers.forEach((header: string) => {
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
    }
    
    return NextResponse.json({ mapping: fallback });
  }
}
