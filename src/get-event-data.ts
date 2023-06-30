import type { EventData } from "./types";

export const getEventData = async (): Promise<EventData> => {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return {};

  return import(eventPath);
};
