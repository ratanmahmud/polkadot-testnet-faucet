import { ConfigManager } from "confmgr/lib";

import botConfigSpec from "../env.bot.config.json";
import serverConfigSpec from "../env.server.config.json";
import { logger } from "./logger";

export type SpecType<T> = T extends { type: "string" }
  ? string
  : T extends { type: "number" }
  ? number
  : T extends { type: "boolean" }
  ? boolean
  : never;

export type BotConfigSpec = typeof botConfigSpec["SMF"]["BOT"];
export type ServerConfigSpec = typeof serverConfigSpec["SMF"]["BACKEND"];

export function faucetBotConfig() {
  const config = faucetConfig("bot");
  return { Get: <K extends keyof BotConfigSpec>(key: K): SpecType<BotConfigSpec[K]> => config.Get("BOT", key) };
}

export function faucetServerConfig() {
  const config = faucetConfig("server");
  return {
    Get: <K extends keyof ServerConfigSpec>(key: K): SpecType<ServerConfigSpec[K]> => config.Get("BACKEND", key),
  };
}

function faucetConfig(appName: "server" | "bot") {
  const config = ConfigManager.getInstance(`env.${appName}.config.json`).getConfig();

  if (process.env.NODE_ENV !== "test") {
    config.Print({ compact: true });

    if (!config.Validate()) {
      console.error(`⭕ - Invalid environment configuration for "${appName}" app`);
    } else {
      logger.info(`✅ ${appName} config validated`);
    }
  }

  return config;
}
