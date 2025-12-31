import { GoogleGenAI } from '@google/genai';
import { Message } from '../utils/types.js';

export class LLMService {
  private genAI: GoogleGenAI;
  private model: any;
  private systemPrompt: string;
  private faqKnowledge: string;

  constructor() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY environment variable is not set');
    }

    this.genAI = new GoogleGenAI({ apiKey });
    this.model = 'gemini-2.0-flash-exp';

    this.systemPrompt = `You are a helpful customer support agent for "Azamon", a small e-commerce store selling electronics and gadgets.

Your role:
- Answer customer questions clearly and concisely
- Be friendly, professional, and helpful
- Use the store information provided below to answer questions
- If you don't know something, be honest and offer to connect them with a human agent
- Keep responses brief (2-3 sentences when possible)

Store Information:
${this.getFAQKnowledge()}`;

    this.faqKnowledge = this.getFAQKnowledge();
  }

  private getFAQKnowledge(): string {
    return `
SHIPPING POLICY:
- We offer FREE standard shipping on orders over $50
- Standard shipping (5-7 business days): $5.99
- Express shipping (2-3 business days): $14.99
- Overnight shipping (1 business day): $29.99
- We ship to all 50 US states and internationally to select countries
- Orders are processed within 1-2 business days
- Tracking information is provided via email once shipped

RETURN & REFUND POLICY:
- 30-day return window from delivery date
- Items must be in original condition with all packaging
- Free returns for defective or damaged items
- Refunds processed within 5-7 business days after we receive the return
- Original shipping costs are non-refundable (except for defective items)
- To initiate a return, email support@azamon.com with your order number

SUPPORT HOURS:
- Live chat: Monday-Friday 9am-6pm EST
- Email support: 24/7 (responses within 24 hours)
- Phone support: Monday-Friday 9am-5pm EST at 1-800-TECH-HELP

PAYMENT METHODS:
- We accept Visa, Mastercard, American Express, Discover
- PayPal and Apple Pay also accepted
- All transactions are secure and encrypted

WARRANTY:
- All products come with manufacturer warranty
- Extended warranty available for purchase at checkout
- Warranty claims should be directed to support@azamstore.com
`;
  }

  async generateReply(
    history: Message[],
    userMessage: string
  ): Promise<string> {
    try {
      const conversationContext = this.buildConversationContext(history);

      const fullPrompt = `${this.systemPrompt}

Previous conversation:
${conversationContext}

Customer: ${userMessage}

Support Agent:`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );

      const generationPromise = this.genAI.models.generateContent({
        model: this.model,
        contents: fullPrompt,
      });

      const result = await Promise.race([generationPromise, timeoutPromise]);

      const text =
        result.candidates?.[0]?.content?.parts
          ?.map((part: any) => part.text)
          .join('') ?? '';

      if (!text || text.trim().length === 0) {
        return "I apologize, but I'm having trouble generating a response right now. Please try again or contact our support team directly.";
      }

      return text.trim();
    } catch (error: any) {
      console.error('LLM Error:', error);

      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key configuration');
      } else if (
        error.message?.includes('quota') ||
        error.message?.includes('rate limit')
      ) {
        throw new Error('Service rate limit exceeded');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Request timeout');
      }

      return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or email us at support@azamon.com for immediate assistance.";
    }
  }

  private buildConversationContext(history: Message[]): string {
    const recentHistory = history.slice(-10);

    return recentHistory
      .map((msg) => {
        const role = msg.sender === 'user' ? 'Customer' : 'Support Agent';
        return `${role}: ${msg.text}`;
      })
      .join('\n');
  }
}
