import type {
  Channel,
  DMChannel,
  Guild,
  GuildBasedChannel,
  Message,
  Role,
  ThreadChannel,
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
      error instanceof DiscordAPIError &&
      error.code === RESTJSONErrorCodes.TargetUserIsNotConnectedToVoice
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
  dmChannel: DMChannel,
  dmMessage: string,
  deletedMessage: string,
): Promise<void> {
  const fullMessage = `${dmMessage}\n\nFor reference, your post was:`;
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

export async function sendNotHGroupDM(message: Message): Promise<void> {
  const dmChannel = await message.author.createDM();
  const dmMessage =
    'Your post in the convention-proposals forum has been deleted because you do not have the "H-Group" role. Do you regularly play pick-up games in this Discord server using the voice channels? If so, please send a direct message to a moderator to request the "H-Group" role. You can find the current list of moderators in the [#role-explanations](<https://discord.com/channels/140016142600241152/930525271780638791/930696130579283978>) channel.';
  await sendDMWithDeletedMessage(dmChannel, dmMessage, message.content);
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
