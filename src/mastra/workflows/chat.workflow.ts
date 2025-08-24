import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import orchestratorAgent from "../agents/orchestrator.agent";
import researchAgent from "../agents/research.agent";
import writerAgent from "../agents/writer.agent";

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
  execute: async ({ inputData }) => {
    const { messages } = inputData;

    const { text } = await researchAgent.generate(messages);
    return { result: text || "Research completed" };
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
  execute: async ({ inputData }) => {
    const { messages } = inputData;

    const { text } = await writerAgent.generate(messages);
    return { result: text || "Writing completed" };
  },
});

const clarificationStep = createStep({
  id: "clarification",
  description: "Returns clarifying questions from the orchestrator",
  inputSchema: z.object({
    messages: z.array(chatMessageSchema),
    route: z.string(),
  }),
  outputSchema: z.object({
    result: z.string(),
  }),
  execute: async ({ inputData }) => {
    const { route } = inputData;
    return { result: route };
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
    [async ({ inputData }) => inputData.route === "writer", writeStep],
    [
      async ({ inputData }) => {
        const route = inputData.route;
        return route !== "research" && route !== "writer";
      },
      clarificationStep,
    ],
  ])
  .commit();

export default chatWorkflow;
