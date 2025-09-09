# PROMPT_LOG.md

## AI Integration Log

This document tracks the AI integration decisions and prompts used in the Signal Watcher project.

### AI Service Implementation

**Date**: 2025-09-09
**Technology**: OpenAI GPT-4
**Purpose**: Security event analysis and severity classification

#### Core Functionality

- **Event Analysis**: AI analyzes security events to provide human-readable summaries
- **Severity Classification**: Automatic classification into LOW/MED/HIGH/CRITICAL levels
- **Action Recommendations**: Suggests next steps for security analysts

#### System Prompt Design

```
You are a cybersecurity analyst AI assistant. Analyze security events and provide:
1. A concise summary in natural language
2. Severity level (LOW, MED, HIGH, CRITICAL)
3. Suggested next action for analysts

Respond in JSON format with fields: summary, severity, suggestedAction.
```

#### Prompt Engineering Strategy

- **Structured Output**: Enforce JSON response format for consistent parsing
- **Context Inclusion**: Include event type, description, metadata, and watchlist terms
- **Severity Guidelines**: Clear definitions for each severity level:
  - LOW: Informational events, routine monitoring
  - MED: Suspicious activity requiring investigation
  - HIGH: Confirmed threats requiring immediate attention
  - CRITICAL: Active attacks or imminent security breaches

#### Mock Mode Implementation

- **Fallback Strategy**: When OpenAI API is unavailable, use intelligent mock responses
- **Pattern Matching**: Mock responses based on event type and keyword analysis
- **Realistic Variation**: Add randomization to mock responses for testing

#### Performance Considerations

- **Async Processing**: AI analysis runs asynchronously to avoid blocking event creation
- **Caching**: Redis caching for AI responses to reduce API costs
- **Error Handling**: Graceful fallback to mock mode on API failures

### Usage Examples

#### High-Severity Event

```json
{
  "summary": "Critical malware signature detected in network traffic indicating active threat. System integrity may be compromised.",
  "severity": "CRITICAL",
  "suggestedAction": "Isolate affected systems immediately, run comprehensive malware scan, and initiate incident response procedures."
}
```

#### Medium-Severity Event

```json
{
  "summary": "Unusual user activity pattern detected. May indicate compromised credentials or insider threat.",
  "severity": "MED",
  "suggestedAction": "Review user activity logs, verify user identity, and consider temporary access restrictions while investigating."
}
```

### Integration Architecture

- **Service Layer**: Dedicated AIService class with OpenAI client
- **Event Pipeline**: AI analysis triggered on event creation
- **Database Updates**: Analysis results stored with correlation to original events
- **Observable**: Structured logging for AI analysis performance and accuracy

### Future Enhancements

- **Model Fine-tuning**: Custom training on security event datasets
- **Confidence Scoring**: Add confidence levels to AI assessments
- **Multi-model Support**: Integration with other AI providers (Claude, Gemini)
- **Feedback Loop**: Analyst feedback to improve AI accuracy over time
