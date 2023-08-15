import type { Client, Guild, GuildChannel } from "discord.js";
import { renameAllChannelsAccordingToOrder } from "../autoCreateVoiceChannels.js";
import { VOICE_CHANNEL_PREFIX } from "../constants.js";
import { getGuildByName } from "../discordUtil.js";
import {
  getChannelIDByName,
  getVoiceChannelsInCategory,
  isVoiceChannelEmpty,
} from "../discordUtilChannels.js";
import { env } from "../env.js";
import { g } from "../globals.js";
import { log } from "../log.js";

export async function onReady(client: Client): Promise<void> {
  if (client.user === null || client.application === null) {
    throw new Error("Failed to connect to Discord.");
  }

  log.info(`Connected to Discord with a username of: ${client.user.username}`);

  const guild = initDiscordVariables(client);
  await deleteEmptyVoiceChannels(guild);
  await renameAllChannelsAccordingToOrder(guild);
}

function initDiscordVariables(client: Client): Guild {
  const guild = getGuildByName(client, env.DISCORD_SERVER_NAME);
  if (guild === undefined) {
    throw new Error(
      `Failed to find Discord server: ${env.DISCORD_SERVER_NAME}`,
    );
  }
  log.info(`Connected to Discord server: ${guild.name}`);

  const categoryID = getChannelIDByName(guild, env.VOICE_CATEGORY_NAME);
  if (categoryID === undefined) {
    throw new Error(
      `Failed to find the voice category of: ${env.VOICE_CATEGORY_NAME}`,
    );
  }
  g.voiceCategoryID = categoryID;

  const voiceChannelID = getChannelIDByName(guild, env.VOICE_JOIN_CHANNEL_NAME);
  if (voiceChannelID === undefined) {
    throw new Error(
      `Failed to find the voice channel of: ${env.VOICE_JOIN_CHANNEL_NAME}`,
    );
  }
  g.voiceJoinChannelID = voiceChannelID;

  const textChannelID = getChannelIDByName(guild, env.QUESTION_CHANNEL_NAME);
  if (textChannelID === undefined) {
    throw new Error(
      `Failed to find the text channel of: ${env.QUESTION_CHANNEL_NAME}`,
    );
  }
  g.questionChannelID = textChannelID;

  g.adminIDs = env.ADMIN_IDS.split(",");

  // Store our user ID for later.
  g.botID = client.user === null ? "" : client.user.id;

  return guild;
}

/**
 * Normally, the bot will delete empty voice channels. So, when the bot first starts, we want to
 * check for any existing empty voice channels and delete them in case they transitioned to being
 * empty when the bot was offline.
 */
async function deleteEmptyVoiceChannels(guild: Guild) {
  const voiceChannels = await getVoiceChannelsInCategory(
    guild,
    g.voiceCategoryID,
  );
  if (voiceChannels === undefined) {
    console.error(
      `Failed to get the channels for category: ${g.voiceCategoryID}`,
    );
    return;
  }

  const promises: Array<Promise<GuildChannel>> = [];
  for (const voiceChannel of voiceChannels) {
    if (!voiceChannel.name.startsWith(VOICE_CHANNEL_PREFIX)) {
      continue;
    }

    if (isVoiceChannelEmpty(voiceChannel)) {
      const promise = voiceChannel.delete();
      promises.push(promise);
    }
  }

  await Promise.all(promises);
}
