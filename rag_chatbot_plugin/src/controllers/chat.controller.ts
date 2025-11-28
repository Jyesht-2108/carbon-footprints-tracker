import { Request, Response } from 'express';
import { EmbeddingService } from '../services/embedding.service';
import { QdrantService } from '../services/qdrant.service';
import { LLMService } from '../services/llm.service';
import { logger } from '../config/logger';
import { getDatabase } from '../config/database';

export class ChatController {
  private embeddingService = new EmbeddingService();
  private qdrantService = new QdrantService();
  private llmService = new LLMService();
  
  chat = async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      logger.info('Processing chat message', { message: message.substring(0, 50) });
      
      // Try to get relevant context from uploaded documents
      let documentContext = '';
      try {
        const queryVector = await this.embeddingService.embedSingle(message);
        const searchResults = await this.qdrantService.search(queryVector, {}, 3);
        
        if (searchResults.length > 0) {
          documentContext = searchResults
            .map(r => r.payload?.textExcerpt || '')
            .filter(t => t.length > 0)
            .join('\n\n');
          logger.info(`Found ${searchResults.length} relevant document chunks from uploaded PDFs`);
        } else {
          logger.info('No relevant document chunks found in Qdrant');
        }
      } catch (error) {
        logger.warn('Failed to search documents, continuing without document context', error);
      }
      
      // Get emissions data context from database
      let emissionsContext = '';
      try {
        const db = getDatabase();
        
        // Get hotspots with emissions data
        const { data: hotspots } = await db
          .from('hotspots')
          .select('*')
          .eq('status', 'active')
          .order('predicted_co2', { ascending: false })
          .limit(10);
        
        // Get recommendations
        const { data: recommendations } = await db
          .from('recommendations')
          .select('*')
          .eq('status', 'pending')
          .order('confidence', { ascending: false })
          .limit(5);
        
        // Get recent events for context
        const { data: recentEvents } = await db
          .from('events_normalized')
          .select('supplier_id, distance_km, load_kg, timestamp')
          .order('timestamp', { ascending: false })
          .limit(10);
        
        // Build context string
        const contextParts = [];
        
        if (hotspots && hotspots.length > 0) {
          // Calculate total emissions from hotspots
          const totalPredicted = hotspots.reduce((sum, h) => sum + (h.predicted_co2 || 0), 0);
          const totalBaseline = hotspots.reduce((sum, h) => sum + (h.baseline_co2 || 0), 0);
          const avgPredicted = totalPredicted / hotspots.length;
          
          contextParts.push(`Current Emissions Status: ${hotspots.length} active hotspots with total predicted emissions of ${totalPredicted.toFixed(2)} kg CO₂ (baseline: ${totalBaseline.toFixed(2)} kg CO₂, average per hotspot: ${avgPredicted.toFixed(2)} kg CO₂)`);
          
          // Top emitters - group by entity type for clarity
          const suppliers = hotspots.filter(h => h.entity_type === 'supplier');
          const otherHotspots = hotspots.filter(h => h.entity_type !== 'supplier');
          
          if (suppliers.length > 0) {
            const supplierSummary = suppliers
              .slice(0, 5)
              .map(h => `${h.entity} (${h.severity.toUpperCase()}: ${h.predicted_co2.toFixed(2)} kg CO₂, ${h.percent_above.toFixed(1)}% above baseline)`)
              .join('; ');
            contextParts.push(`Top Supplier Emitters: ${supplierSummary}`);
          }
          
          if (otherHotspots.length > 0) {
            const otherSummary = otherHotspots
              .slice(0, 3)
              .map(h => `${h.entity} [${h.entity_type}] (${h.severity.toUpperCase()}: ${h.predicted_co2.toFixed(2)} kg CO₂)`)
              .join('; ');
            contextParts.push(`Other Hotspots: ${otherSummary}`);
          }
        }
        
        if (recommendations && recommendations.length > 0) {
          const totalReduction = recommendations.reduce((sum, r) => sum + (r.co2_reduction || 0), 0);
          const recSummary = recommendations
            .map(r => `"${r.title}" (${r.co2_reduction} kg CO₂ reduction, ${(r.confidence * 100).toFixed(0)}% confidence)`)
            .join('; ');
          contextParts.push(`Pending Recommendations (Total potential reduction: ${totalReduction.toFixed(2)} kg CO₂): ${recSummary}`);
        }
        
        if (recentEvents && recentEvents.length > 0) {
          const suppliers = [...new Set(recentEvents.map(e => e.supplier_id))];
          contextParts.push(`Recent Activity: ${recentEvents.length} events from ${suppliers.length} suppliers (${suppliers.join(', ')})`);
        }
        
        emissionsContext = contextParts.join('\n\n');
        logger.info('Retrieved emissions context from database');
      } catch (error) {
        logger.warn('Failed to get emissions context', error);
      }
      
      // Generate response using LLM
      const systemPrompt = `You are a Carbon Intelligence AI assistant helping users understand and reduce their carbon emissions.

You have access to:
1. Real-time emissions data from their supply chain
2. Uploaded documents (PDFs, text files) that users have shared
3. Active hotspots and recommendations

${emissionsContext ? `Current Emissions Data:\n${emissionsContext}\n` : ''}

${documentContext ? `Uploaded Documents Content:\n${documentContext}\n\nIMPORTANT: The user just uploaded a document. Answer their questions based on the document content above.` : 'Note: No documents have been uploaded yet. Focus on emissions data.'}

Provide helpful, actionable advice. Be concise but informative. Use specific numbers and quotes from the context when available.`;

      const response = await this.llmService.generateChatResponse(message, systemPrompt);
      
      logger.info('Chat response generated');
      res.json({ 
        response: response,
        hasDocumentContext: documentContext.length > 0,
        hasEmissionsContext: emissionsContext.length > 0
      });
      
    } catch (error: any) {
      logger.error('Chat failed', error);
      
      // Return 200 with fallback message so frontend can display it
      res.json({ 
        response: 'I apologize, but I\'m experiencing temporary difficulties connecting to the AI service. However, I can still help you! Here\'s what I can tell you:\n\n' +
                  '• You have active hotspots that need attention\n' +
                  '• There are pending recommendations to reduce emissions\n' +
                  '• Your emissions data is being monitored\n\n' +
                  'Please try asking your question again in a moment, or try rephrasing it.',
        hasDocumentContext: false,
        hasEmissionsContext: false,
        error: 'AI service temporarily unavailable'
      });
    }
  };
}
