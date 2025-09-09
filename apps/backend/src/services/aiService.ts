import { config } from "@/config/environment";
import { logger } from "@/utils/logger";
import { AIAnalysis, Severity } from "@signal-watcher/shared";
import OpenAI from "openai";

export class AIService {
  private openai: OpenAI | null = null;
  private mockMode: boolean;

  constructor() {
    this.mockMode = !config.openaiApiKey;

    if (!this.mockMode) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    }

    logger.info("AI Service initialized", {
      mode: this.mockMode ? "mock" : "real",
      model: config.openaiModel,
    });
  }

  async analyzeEvent(
    eventType: string,
    description: string,
    metadata: Record<string, any>,
    watchlistTerms: string[],
    correlationId: string
  ): Promise<AIAnalysis> {
    try {
      if (this.mockMode) {
        return this.generateMockAnalysis(
          eventType,
          description,
          watchlistTerms
        );
      }

      const prompt = this.buildAnalysisPrompt(
        eventType,
        description,
        metadata,
        watchlistTerms
      );

      const completion = await this.openai!.chat.completions.create({
        model: config.openaiModel,
        messages: [
          {
            role: "system",
            content:
              "You are a cybersecurity analyst AI assistant. Analyze security events and provide structured responses in JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from AI");
      }

      const analysis = this.parseAIResponse(response);

      logger.info("AI analysis completed", {
        eventType,
        severity: analysis.severity,
        correlationId,
      });

      return analysis;
    } catch (error) {
      logger.error("AI analysis failed", { error, eventType, correlationId });

      // Fallback to mock analysis on error
      return this.generateMockAnalysis(eventType, description, watchlistTerms);
    }
  }

  private buildAnalysisPrompt(
    eventType: string,
    description: string,
    metadata: Record<string, any>,
    watchlistTerms: string[]
  ): string {
    return `
Analyze this security event and provide a JSON response with the following structure:
{
  "summary": "A brief, clear summary of the event in 1-2 sentences",
  "severity": "LOW|MED|HIGH|CRITICAL",
  "suggestedAction": "Specific actionable recommendation for the analyst"
}

Event Details:
- Type: ${eventType}
- Description: ${description}
- Metadata: ${JSON.stringify(metadata, null, 2)}
- Watchlist Terms: ${watchlistTerms.join(", ")}

Severity Guidelines:
- LOW: Informational events, routine monitoring
- MED: Suspicious activity requiring investigation
- HIGH: Confirmed threats requiring immediate attention
- CRITICAL: Active attacks or imminent security breaches

Provide only the JSON response, no additional text.
    `.trim();
  }

  private parseAIResponse(response: string): AIAnalysis {
    try {
      // Clean up response - remove markdown formatting if present
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanResponse);

      // Validate the response structure
      if (!parsed.summary || !parsed.severity || !parsed.suggestedAction) {
        throw new Error("Invalid AI response structure");
      }

      // Validate severity
      const validSeverities: Severity[] = ["LOW", "MED", "HIGH", "CRITICAL"];
      if (!validSeverities.includes(parsed.severity)) {
        parsed.severity = "MED"; // Default fallback
      }

      return {
        summary: parsed.summary,
        severity: parsed.severity as Severity,
        suggestedAction: parsed.suggestedAction,
      };
    } catch (error) {
      logger.warn("Failed to parse AI response, using fallback", {
        response,
        error,
      });

      return {
        summary: "Security event detected requiring analysis",
        severity: "MED",
        suggestedAction: "Review event details and investigate further",
      };
    }
  }

  private generateMockAnalysis(
    eventType: string,
    description: string,
    watchlistTerms: string[]
  ): AIAnalysis {
    // Simple mock logic for demonstration
    const eventLower = `${eventType} ${description}`.toLowerCase();

    let severity: Severity = "LOW";
    let summary = `${eventType} event detected`;
    let suggestedAction = "Monitor for additional activity";

    // Mock severity detection based on keywords
    if (
      eventLower.includes("critical") ||
      eventLower.includes("breach") ||
      eventLower.includes("attack")
    ) {
      severity = "CRITICAL";
      summary = `Critical security incident: ${eventType}`;
      suggestedAction =
        "Immediate incident response required - escalate to security team";
    } else if (
      eventLower.includes("suspicious") ||
      eventLower.includes("malware") ||
      eventLower.includes("threat")
    ) {
      severity = "HIGH";
      summary = `High-priority security alert: ${eventType}`;
      suggestedAction =
        "Investigate immediately and block if confirmed malicious";
    } else if (
      eventLower.includes("unusual") ||
      eventLower.includes("anomaly")
    ) {
      severity = "MED";
      summary = `Medium-priority security event: ${eventType}`;
      suggestedAction =
        "Review and investigate for potential security implications";
    }

    // Check if any watchlist terms are mentioned
    const matchedTerms = watchlistTerms.filter((term) =>
      eventLower.includes(term.toLowerCase())
    );

    if (matchedTerms.length > 0) {
      summary += ` (matches watchlist terms: ${matchedTerms.join(", ")})`;
    }

    logger.info("Mock AI analysis generated", {
      eventType,
      severity,
      matchedTerms: matchedTerms.length,
    });

    return { summary, severity, suggestedAction };
  }
}

export const aiService = new AIService();
