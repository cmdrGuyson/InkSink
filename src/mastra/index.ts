import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import writerAgent from "./agents/writer.agent";
import titleAgent from "./agents/title.agent";
import researchAgent from "./agents/research.agent";
import chatWorkflow from "./workflows/chat.workflow";

export const mastra = new Mastra({
  workflows: { chatWorkflow },
  agents: { writerAgent, titleAgent, researchAgent },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
