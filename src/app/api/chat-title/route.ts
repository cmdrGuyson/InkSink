import { mastra } from "../../../mastra";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required and must be a string" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const titleAgent = mastra.getAgent("titleAgent");

    // Create a simple message structure for the agent
    const messages = [
      {
        role: "user" as const,
        content: message,
      },
    ];

    const response = await titleAgent.generate(messages);

    // Extract the title from the response
    const title = response.text.trim();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Failed to generate title" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ title }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating chat title:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
