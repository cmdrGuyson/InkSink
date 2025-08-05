import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import writerAgent from "./agents/writer.agent";
import titleAgent from "./agents/title.agent";

export const mastra = new Mastra({
  workflows: {},
  agents: { writerAgent, titleAgent },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
