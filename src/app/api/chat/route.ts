import { getSystemInstructions } from "@/mastra/agents/writer.agent";
import { mastra } from "../../../mastra";

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, content, style } = body;

  const writerAgent = mastra.getAgent("writerAgent");

  const instructions = getSystemInstructions({ content, style });

  const stream = await writerAgent.stream(messages, {
    instructions,
  });

  return stream.toDataStreamResponse();
}
