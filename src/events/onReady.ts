import { Client, Guild, GuildChannel } from "discord.js";
import { renameAllChannelsAccordingToOrder } from "../autoCreateVoiceChannels";
import { VOICE_CHANNEL_PREFIX } from "../constants";
import { getGuildByName } from "../discordUtil";
import {
  getChannelIDByName,
  getChannelsInCategory,
  isVoiceChannelEmpty,
} from "../discordUtilChannels";
import g from "../globals";
import { error } from "../util";

export async function onReady(client: Client) {
  if (client.user === null || client.application === null) {
    error("Failed to connect to Discord.");
  }

  console.log(
    `Connected to Discord with a username of: ${client.user.username}`,
  );

  const guild = initDiscordVariables(client);
  await deleteEmptyVoiceChannels(guild);
  await renameAllChannelsAccordingToOrder(guild);

  g.ready = true;
}

function initDiscordVariables(client: Client): Guild {
  const guild = getGuildByName(client, g.discordServerName);
  if (guild === null) {
    error(`Failed to find Discord server: ${g.discordServerName}`);
  }
  console.log(`Connected to Discord server: ${guild.name}`);

  const categoryID = getChannelIDByName(guild, g.voiceCategoryName);
  if (categoryID === null) {
    error(`Failed to find the voice category of: ${g.voiceCategoryName}`);
  }
  g.voiceCategoryID = categoryID;

  const voiceChannelID = getChannelIDByName(guild, g.voiceJoinChannelName);
  if (voiceChannelID === null) {
    error(`Failed to find the voice channel of: ${g.voiceJoinChannelName}`);
  }
  g.voiceJoinChannelID = voiceChannelID;

  const textChannelID = getChannelIDByName(guild, g.questionChannelName);
  if (textChannelID === null) {
    error(`Failed to find the text channel of: ${g.questionChannelName}`);
  }
  g.questionChannelID = textChannelID;

  // Store our user ID for later
  g.botID = client.user === null ? "" : client.user.id;

  return guild;
}

/**
 * Normally, the bot will delete empty voice channels. So, when the bot first starts, we want to
 * check for any existing empty voice channels and delete them in case they transitioned to being
 * empty when the bot was offline.
 */
async function deleteEmptyVoiceChannels(guild: Guild) {
  const channels = await getChannelsInCategory(guild, g.voiceCategoryID);
  if (channels === null) {
    console.error(
      `Failed to get the channels for category: ${g.voiceCategoryID}`,
    );
    return;
  }

  const promises: Array<Promise<GuildChannel>> = [];
  for (const channel of channels) {
    if (!channel.name.startsWith(VOICE_CHANNEL_PREFIX)) {
      continue;
    }

    if (isVoiceChannelEmpty(channel)) {
      const promise = channel.delete();
      promises.push(promise);
    }
  }

  await Promise.all(promises);
}
