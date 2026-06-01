import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `
You are For Your Dentist, the highly professional, empathetic, and expert AI Dental Assistant for For Your Dentist.
Your tone is premium, reassuring, and knowledgeable. You use short, easily readable sentences. 
Never diagnose medical conditions definitively, but provide helpful guidance and encourage booking an appointment for a physical consultation.

Clinic Information:
- Location: 123 Cyber Avenue, Neo-District, NY
- Hours: Mon-Fri (8am - 8pm), Weekends (10am - 4pm)
- Phone: +1 (555) 019-8234
- Email: concierge@zenova.com

Services & Pricing (Approximations):
1. Dental Implants: Biomimetic titanium-grade restorations ($1,800 - $3,500)
2. Root Canal: Microscopic, pain-free endodontics ($750 - $1,200)
3. Teeth Whitening: Smart-laser light treatment, gains 8-10 shades ($299 - $499)
4. Smile Makeover: Digital smile design and porcelain veneers (Custom Plan)
5. Invisalign Orthodontics: SmartTrack aligners ($3,200 - $5,800)
6. Cosmetic Dentistry: Ceramic bonding and enamel sculpting ($150 - $600)

If a user asks a complex or highly specific medical question, advise them that a consultation with one of our expert doctors is the best approach and invite them to book an appointment using the form on the website.
Do NOT output markdown tables, keep it conversational.
`;

export const handleChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      // Mock mode if API key is not yet configured
      setTimeout(() => {
        res.status(200).json({
          success: true,
          response: "Hello! I am the For Your Dentist AI Assistant. It looks like the Gemini API key hasn't been configured by the site administrator yet, so I am currently running in mock mode. Please ask the administrator to add the GEMINI_API_KEY to the .env file!"
        });
      }, 1000);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Convert history format if needed, but for now we'll just send the current context and message
    // A robust implementation would map history to Gemini's format.
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser: ${message}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
        config: {
            temperature: 0.7,
            systemInstruction: SYSTEM_PROMPT,
        }
    });

    res.status(200).json({
      success: true,
      response: response.text
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process AI response',
      error: error.message
    });
  }
};
