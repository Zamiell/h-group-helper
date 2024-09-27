/**
 * These are all Discord-related variables that come from either environment variables or Discord
 * API calls upon first connection.
 */
export class Globals {
  voiceCategoryID = "";
  createNewVoiceJoinChannelID = "";
  questionForumID = "";
  proposalForumID = "";
  adminIDs: string[] = [];
  botID = "";
}
