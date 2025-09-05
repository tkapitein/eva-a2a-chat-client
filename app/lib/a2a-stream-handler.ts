import { getA2AClient } from "~/lib/get-a2a-client";
import type { MessageSendParams } from "@a2a-js/sdk";
import {
  getStatusIcon,
  updateMessage,
  appendToMessage,
} from "./message-handler";
import { type ChatRecord } from "~/db/chat-db";

export interface StreamMessageParams {
  text: string;
  chat: ChatRecord;
  assistantId: string;
  request: Request;
}

export async function streamMessage({
  text,
  chat,
  assistantId,
  request,
}: StreamMessageParams): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = await getA2AClient();

    const sendParams: MessageSendParams = {
      message: {
        messageId: crypto.randomUUID(),
        role: "user",
        parts: [{ kind: "text", text }],
        kind: "message",
        contextId: chat.contextId,
      },
      configuration: {
        blocking: false,
        acceptedOutputModes: ["text/plain", "text/markdown"],
      },
    };

    const stream = client.sendMessageStream(sendParams);
    let hasContent = false;
    let currentTaskId: string | undefined;

    for await (const event of stream) {
      if (event.kind === "task") {
        currentTaskId = event.id;
        const statusIcon = getStatusIcon(event.status.state);
        await updateMessage(assistantId, {
          content: `${statusIcon} Task ${event.id.slice(0, 8)}: ${event.status.state}`,
          taskId: event.id,
          taskStatus: event.status.state as any,
        });
      }

      if (event.kind === "status-update") {
        const statusIcon = getStatusIcon(event.status.state);
        const statusMessage = `${statusIcon} Task ${(event.taskId || currentTaskId || "unknown").slice(0, 8)}: ${event.status.state}`;

        await updateMessage(assistantId, {
          taskStatus: event.status.state as any,
        });

        if (!hasContent) {
          await updateMessage(assistantId, {
            content: statusMessage,
          });
        }

        if (event.final && !hasContent) {
          await updateMessage(assistantId, {
            content: statusMessage,
          });
        }
      }

      if (event.kind === "artifact-update") {
        const textParts = (event.artifact?.parts ?? []).filter(
          (p) => p.kind === "text" && typeof (p as any).text === "string"
        ) as Array<{ kind: "text"; text: string }>;

        if (textParts.length > 0) {
          const chunk = textParts.map((p) => p.text).join("");
          if (!hasContent) {
            await updateMessage(assistantId, { content: chunk });
            hasContent = true;
          } else {
            await appendToMessage(assistantId, chunk);
          }
        }
      }

      if (event.kind === "message") {
        const textParts = (event.parts ?? []).filter(
          (p) => p.kind === "text" && typeof (p as any).text === "string"
        ) as Array<{ kind: "text"; text: string }>;

        if (textParts.length > 0) {
          const chunk = textParts.map((p) => p.text).join("");
          if (!hasContent) {
            await updateMessage(assistantId, { content: chunk });
            hasContent = true;
          } else {
            await appendToMessage(assistantId, chunk);
          }
        }
      }
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateMessage(assistantId, {
      content: `Error from A2A: ${message}`,
    });
    return { ok: false, error: message };
  }
}
