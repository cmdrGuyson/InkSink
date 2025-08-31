import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import orchestratorAgent from "../agents/orchestrator.agent";
import researchAgent from "../agents/research.agent";
import writerAgent from "../agents/writer.agent";
import assistantAgent from "../agents/assistant.agent";
import { CoreMessage } from "@mastra/core";

export const getChatMessagesWithInstructions = (
  messages: { role: string; content: string }[],
  content?: string
) => {
  if (!messages.length || !content) {
    return messages;
  }

  // Find the last user message
  const lastUserMessageIndex = messages.findLastIndex(
    (message) => message.role === "user"
  );

  if (lastUserMessageIndex === -1) {
    return messages;
  }

  if (!content.trim()) {
    return messages;
  }

  // Create enriched message with content and instructions
  const enrichedMessage = {
    role: "user" as const,
    content: `Follow the user instructions based on the provided content.
    
### Task: User Instructions
Based on the content above, please follow these instructions:

${messages[lastUserMessageIndex].content}    

### Context: Existing Content
Here is the content that has already been written:

"""
${content}
"""
`,
  };

  // Create new messages array with enriched last user message
  const updatedMessages = [...messages];
  updatedMessages[lastUserMessageIndex] = enrichedMessage;

  return updatedMessages;
};

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const orchestrateStep = createStep({
  id: "orchestrate",
  description:
    "Determines whether the user wants research or writing assistance",
  inputSchema: z.object({
    messages: z.array(chatMessageSchema),
    content: z.string().optional(),
  }),
  outputSchema: z.object({
    messages: z.array(chatMessageSchema),
    route: z.string(),
    content: z.string().optional(),
  }),
  execute: async ({ inputData }) => {
    const { messages, content } = inputData;

    // Use the orchestrator agent to determine the route
    const { text: route } = await orchestratorAgent.generate(
      getChatMessagesWithInstructions(messages, content) as CoreMessage[]
    );

    // Clean the route string to remove any JSON formatting
    const cleanRoute = route?.replace(/^["']|["']$/g, "") || "";

    return { messages, route: cleanRoute, content };
  },
});

const researchStep = createStep({
  id: "research",
  description: "Handles research requests using the research agent",
  inputSchema: z.object({
    messages: z.array(chatMessageSchema),
    route: z.string(),
    content: z.string().optional(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData, writer }) => {
    const { messages, content } = inputData;

    const stream = await researchAgent.streamVNext(
      getChatMessagesWithInstructions(messages, content) as CoreMessage[]
    );
    await stream.pipeTo(writer);

    return { result: await stream.text };
  },
});

const writeStep = createStep({
  id: "write",
  description: "Handles writing requests using the writer agent",
  inputSchema: z.object({
    messages: z.array(chatMessageSchema),
    route: z.string(),
    content: z.string().optional(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData, writer }) => {
    const { messages, content } = inputData;

    const stream = await writerAgent.streamVNext(
      getChatMessagesWithInstructions(messages, content) as CoreMessage[]
    );

    await stream.pipeTo(writer);

    return { result: await stream.text };
  },
});

const assistantStep = createStep({
  id: "assistant",
  description: "Handles general questions and chat using the assistant agent",
  inputSchema: z.object({
    messages: z.array(chatMessageSchema),
    route: z.string(),
    content: z.string().optional(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData, writer }) => {
    const { messages, content } = inputData;

    const stream = await assistantAgent.streamVNext(
      getChatMessagesWithInstructions(messages, content) as CoreMessage[]
    );
    await stream.pipeTo(writer);

    return { result: await stream.text };
  },
});

const chatWorkflow = createWorkflow({
  id: "chat-workflow",
  description: "InkSink Chat Orchestration Workflow",
  inputSchema: z.object({
    messages: z.array(chatMessageSchema),
    content: z.string().optional(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
})
  .then(orchestrateStep)
  .branch([
    [async ({ inputData }) => inputData.route === "research", researchStep],
    [async ({ inputData }) => inputData.route === "write", writeStep],
    [
      async ({ inputData }) => !["research", "write"].includes(inputData.route),
      assistantStep,
    ],
  ])
  .commit();

export default chatWorkflow;
