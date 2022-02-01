/**
 * These are all Discord-related variables that come from either environment variables or Discord
 * API calls upon first connection.
 */
export class Globals {
  discordServerName = "";
  voiceCategoryName = "";
  voiceCategoryID = "";
  voiceJoinChannelName = "";
  voiceJoinChannelID = "";
  questionChannelName = "";
  questionChannelID = "";
  adminIDs: string[] = [];
  botID = "";
  ready = false;
}
