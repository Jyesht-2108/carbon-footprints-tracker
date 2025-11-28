import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from 'langchain/prompts';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { SearchResult } from './qdrant.service';

export interface QueryResponse {
  answer: string;
  citations: Array<{
    fileName: string;
    page: number;
    score: number;
    excerpt: string;
  }>;
}

export class LLMService {
  private model: ChatGoogleGenerativeAI;
  private promptTemplate: PromptTemplate;
  
  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      apiKey: config.gemini.apiKey,
      modelName: config.gemini.model,
      temperature: 0.1,
      maxOutputTokens: 1024
    });
    
    this.promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful assistant for students. Answer questions based ONLY on the provided context from uploaded PDF notes.

Context from PDFs:
{context}

Question: {question}

Instructions:
- Answer concisely and accurately based on the context
- Cite the source (file name and page number) when possible
- If the context doesn't contain enough information, say "I don't have enough information in the uploaded notes to answer that."
- Do not make up information or use knowledge outside the provided context

Answer:`);
  }
  
  async generateAnswer(
    question: string,
    searchResults: SearchResult[]
  ): Promise<QueryResponse> {
    try {
      const context = this.buildContext(searchResults);
      const prompt = await this.promptTemplate.format({ context, question });
      
      const response = await this.model.invoke(prompt);
      const answer = typeof response.content === 'string' 
        ? response.content 
        : response.content.toString();
      
      const citations = searchResults.map(r => ({
        fileName: r.payload.fileName,
        page: r.payload.page,
        score: r.score,
        excerpt: r.payload.textExcerpt.substring(0, 150) + '...'
      }));
      
      logger.info('Generated answer for query');
      return { answer, citations };
    } catch (error) {
      logger.error('LLM generation failed', error);
      throw new Error('Failed to generate answer');
    }
  }
  
  async generateChatResponse(
    message: string,
    systemPrompt: string
  ): Promise<string> {
    // Try up to 3 times for chat (more important than recommendations)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const chatPrompt = `${systemPrompt}

User Question: ${message}

Provide a helpful, concise answer:`;
        
        const response = await this.model.invoke(chatPrompt);
        
        // Check if response has content
        if (!response || !response.content) {
          logger.warn(`Chat attempt ${attempt}: Empty response from AI model`);
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            continue;
          }
          throw new Error('Empty response from AI model after 3 attempts');
        }
        
        const answer = typeof response.content === 'string' 
          ? response.content 
          : response.content.toString();
        
        logger.info(`Generated chat response (attempt ${attempt})`);
        return answer;
        
      } catch (error: any) {
        logger.error(`Chat attempt ${attempt} failed`, { 
          error: error.message,
          stack: error.stack?.split('\n')[0]
        });
        
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          continue;
        }
        
        // Final fallback after all attempts
        throw new Error('Failed to generate chat response after 3 attempts');
      }
    }
    
    // Should never reach here, but TypeScript needs it
    throw new Error('Failed to generate chat response');
  }
  
  private buildContext(results: SearchResult[]): string {
    return results
      .map((r, idx) => 
        `[Source ${idx + 1}: ${r.payload.fileName}, Page ${r.payload.page}]\n${r.payload.textExcerpt}`
      )
      .join('\n\n---\n\n');
  }
}
