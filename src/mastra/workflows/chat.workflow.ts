import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import orchestratorAgent from "../agents/orchestrator.agent";
import researchAgent from "../agents/research.agent";
import writerAgent from "../agents/writer.agent";
import assistantAgent from "../agents/assistant.agent";

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
  }),
  outputSchema: z.object({
    messages: z.array(chatMessageSchema),
    route: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { messages } = inputData;

    // Use the orchestrator agent to determine the route
    const { text: route } = await orchestratorAgent.generate(messages);

    // Clean the route string to remove any JSON formatting
    const cleanRoute = route?.replace(/^["']|["']$/g, "") || "";

    return { messages, route: cleanRoute };
  },
});

const researchStep = createStep({
  id: "research",
  description: "Handles research requests using the research agent",
  inputSchema: z.object({
    messages: z.array(chatMessageSchema),
    route: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData, writer }) => {
    const { messages } = inputData;

    const stream = await researchAgent.streamVNext(messages);
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
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData, writer }) => {
    const { messages } = inputData;

    const stream = await writerAgent.streamVNext(messages);
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
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData, writer }) => {
    const { messages } = inputData;

    const stream = await assistantAgent.streamVNext(messages);
    await stream.pipeTo(writer);

    return { result: await stream.text };
  },
});

const chatWorkflow = createWorkflow({
  id: "chat-workflow",
  description: "InkSink Chat Orchestration Workflow",
  inputSchema: z.object({
    messages: z.array(chatMessageSchema),
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
