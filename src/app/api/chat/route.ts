import { mastra } from "../../../mastra";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const writerAgent = mastra.getAgent("writerAgent");
  const stream = await writerAgent.stream(messages);

  return stream.toDataStreamResponse();
}
