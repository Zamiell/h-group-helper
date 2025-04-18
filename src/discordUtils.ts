import { filterMap } from "complete-common";
import type {
  Channel,
  Guild,
  GuildBasedChannel,
  Role,
  ThreadChannel,
  User,
  VoiceBasedChannel,
} from "discord.js";
import { DiscordAPIError, RESTJSONErrorCodes } from "discord.js";
import { logger } from "./logger.js";
import { isNotNullUndefined } from "./utils.js";

/**
 * If messages exceed this length, the Discord API will give an error:
 *
 * ```txt
 * DiscordAPIError[50035]: Invalid Form Body
 * content[BASE_TYPE_MAX_LENGTH]: Must be 2000 or fewer in length.
 * ```
 */
const MAX_DISCORD_MESSAGE_LENGTH = 2000;

const URL_REGEX = /https?:\/\/[^\s<>]+/g;

export async function memberHasRole(
  guild: Guild,
  userID: string,
  roleID: string,
): Promise<boolean> {
  const member = await guild.members.fetch(userID);
  return member.roles.cache.has(roleID);
}

/** This works for both channels and forums. */
export function getChannelByName(
  guild: Guild,
  channelName: string,
): GuildBasedChannel | undefined {
  return guild.channels.cache.find((channel) => channel.name === channelName);
}

/**
 * In Discord, you can disable the automatic link preview by enclosing a link in < and > characters.
 * This is usually preferable because it reduces spam.
 */
export function getNonEnclosedLinks(messageContent: string): readonly string[] {
  const urls = messageContent.match(URL_REGEX);
  if (urls === null) {
    return [];
  }

  return filterMap(urls, (url) =>
    messageContent.includes(`<${url}>`) ? undefined : url,
  );
}

export function getRoleByName(
  guild: Guild,
  roleName: string,
): Role | undefined {
  return guild.roles.cache.find((role) => role.name === roleName);
}

export function getVoiceChannelsInCategory(
  guild: Guild,
  categoryID: string,
): readonly VoiceBasedChannel[] {
  const allChannels = [...guild.channels.cache.values()];
  const channels = allChannels.filter(isNotNullUndefined);
  const voiceChannels = channels.filter((channel) => channel.isVoiceBased());

  const voiceChannelsInCategory = voiceChannels.filter(
    (channel) => channel.parentId === categoryID,
  );

  return voiceChannelsInCategory;
}

export function isVoiceChannelEmpty(channel: VoiceBasedChannel): boolean {
  return channel.members.size === 0;
}

export async function moveUserToVoiceChannel(
  guild: Guild,
  userID: string,
  newChannelID: string,
): Promise<void> {
  const member = await guild.members.fetch(userID);
  try {
    await member.voice.setChannel(newChannelID);
  } catch (error) {
    if (
      error instanceof DiscordAPIError
      && error.code === RESTJSONErrorCodes.TargetUserIsNotConnectedToVoice
    ) {
      logger.info(
        `Failed to move user "${userID}" to channel "${newChannelID}" because they are no longer connected to voice.`,
      );
    } else {
      logger.error(
        `Failed to move user "${userID}" to channel "${newChannelID}": ${error}`,
      );
    }
  }
}

export async function sendDMWithDeletedMessage(
  user: User,
  dmMessage: string,
  deletedMessage: string,
): Promise<void> {
  const dmChannel = await user.createDM();

  const fullMessage = `${dmMessage}\n\nFor reference, your deleted post was:`;
  await sendDMAndLog(dmChannel, fullMessage);

  const ticks = "```\n";
  const sizeOfSurroundingTicks = ticks.length * 2;
  const maxLengthOfDeletedMessage =
    MAX_DISCORD_MESSAGE_LENGTH - sizeOfSurroundingTicks;
  const trimmedDeletedMessage = deletedMessage.slice(
    0,
    maxLengthOfDeletedMessage,
  );
  const fullDeletedMessage = ticks + trimmedDeletedMessage + ticks;
  await sendDMAndLog(dmChannel, fullDeletedMessage);
}

/**
 * We only need to log direct messages, because messages that appear in channels will be logged as
 * part of the normal channel logging process.
 */
async function sendDMAndLog(
  channel: Channel | ThreadChannel,
  message: string,
): Promise<void> {
  if (channel.isSendable()) {
    await channel.send(message);
    logger.info(`Sent: ${message}`);
  }
}
