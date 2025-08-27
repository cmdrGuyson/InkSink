import { NextRequest } from "next/server";
import { mastra } from "@/mastra";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CreditService } from "@/backend-services/credit.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }

    // Check if user has enough credits
    const credits = await CreditService.getCredits(user.id);
    if (credits < 1) {
      return new Response(
        JSON.stringify({
          error:
            "Insufficient credits. Please purchase more credits to continue.",
        }),
        {
          status: 402,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const { messages } = body ?? {};

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array required" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        }
      );
    }

    const workflow = mastra.getWorkflow("chatWorkflow");
    const run = await workflow.createRunAsync();
    const stream = await run.streamVNext({ inputData: { messages } });

    const sseStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        // Send initial event to open SSE
        controller.enqueue(
          encoder.encode(`event: open\n` + `data: {"ok":true}\n\n`)
        );

        try {
          for await (const chunk of stream) {
            controller.enqueue(
              encoder.encode(
                `event: message\n` + `data: ${JSON.stringify(chunk)}\n\n`
              )
            );
          }

          // Final result event
          const result = await stream.result;
          controller.enqueue(
            encoder.encode(
              `event: result\n` + `data: ${JSON.stringify(result)}\n\n`
            )
          );

          // Deduct a credit after execution
          try {
            await CreditService.deductCredit(user.id, credits);
          } catch (creditError) {
            console.error("Failed to deduct credit:", creditError);
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "stream error";
          controller.enqueue(
            encoder.encode(
              `event: error\n` + `data: ${JSON.stringify({ message })}\n\n`
            )
          );
        } finally {
          controller.enqueue(
            encoder.encode(`event: close\n` + `data: {"ok":true}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(sseStream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "bad request";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
}
