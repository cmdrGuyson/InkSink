import { openai } from "@ai-sdk/openai";
import {
  UnicodeNormalizer,
  ModerationInputProcessor,
  PromptInjectionDetector,
  PIIDetector,
} from "@mastra/core/agent/input-processor/processors";

const DEFAULT_PROCESSORS = [
  // 1. Normalize text
  new UnicodeNormalizer({ stripControlChars: true }),
  // 2. Check for security threats
  new PromptInjectionDetector({ model: openai("gpt-4.1-nano") }),
  // 3. Moderate content
  new ModerationInputProcessor({ model: openai("gpt-4.1-nano") }),
  // 4. Handle PII
  new PIIDetector({ model: openai("gpt-4.1-nano"), strategy: "redact" }),
];

export default DEFAULT_PROCESSORS;
