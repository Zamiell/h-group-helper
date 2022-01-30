import { Client, Guild, Intents, Message, VoiceState } from "discord.js";
import { autoCreateVoiceChannels } from "./autoCreate";
import {
  autoDeleteEmptyVoiceChannels,
  checkEmptyVoiceChannels,
} from "./autoDelete";
import { autoStartThread } from "./autoStartThread";
import { checkCommand } from "./command";
import { getGuildByName } from "./discordUtil";
import { getChannelIDByName } from "./discordUtilChannels";
import { getEnvironmentVariables } from "./util";

let serverName: string;
let voiceCategoryName: string;
let voiceCategoryID: string;
let voiceJoinChannelName: string;
let voiceJoinChannelID: string;
let questionChannelName: string;
let questionChannelID: string;
let adminIDs: string[];
let botID: string;

export async function discordInit() {
  const [
    discordToken,
    discordServerName,
    voiceCategoryNameString,
    voiceJoinChannelNameString,
    questionChannelNameString,
    adminIDsString,
  ] = getEnvironmentVariables([
    "DISCORD_TOKEN",
    "DISCORD_SERVER_NAME",
    "VOICE_CATEGORY_NAME",
    "VOICE_JOIN_CHANNEL_NAME",
    "QUESTION_CHANNEL_NAME",
    "ADMIN_IDS",
  ]);
  serverName = discordServerName;
  voiceCategoryName = voiceCategoryNameString;
  voiceJoinChannelName = voiceJoinChannelNameString;
  questionChannelName = questionChannelNameString;
  adminIDs = adminIDsString.split(",");

  const client = new Client({
    // Intents are needed for Discord to send specific types of data
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
  });
  await client.login(discordToken);

  client.on("ready", onReady);
  client.on("messageCreate", onMessageCreate);
  client.on("voiceStateUpdate", onVoiceStateUpdate);
}

async function onReady(client: Client) {
  console.log("HELLO");

  if (client.user === null || client.application === null) {
    return;
  }

  console.log(
    `Connected to Discord with a username of: ${client.user.username}`,
  );

  // Store our user ID for later
  botID = client.user.id;

  const guild = getGuildByName(client, serverName);
  if (guild === null) {
    console.error(`Failed to find Discord server: ${serverName}`);
    return;
  }
  console.log(`Connected to Discord server: ${guild.name}`);

  const categoryID = getChannelIDByName(guild, voiceCategoryName);
  if (categoryID === null) {
    console.error(`Failed to find the voice category of: ${voiceCategoryName}`);
    return;
  }
  voiceCategoryID = categoryID;

  const voiceChannelID = getChannelIDByName(guild, voiceJoinChannelName);
  if (voiceChannelID === null) {
    console.error(
      `Failed to find the voice channel of: ${voiceJoinChannelName}`,
    );
    return;
  }
  voiceJoinChannelID = voiceChannelID;

  const textChannelID = getChannelIDByName(guild, questionChannelName);
  if (textChannelID === null) {
    console.error(`Failed to find the text channel of: ${questionChannelName}`);
    return;
  }
  questionChannelID = textChannelID;

  await checkEmptyVoiceChannels(guild, voiceCategoryID);
}

async function onMessageCreate(message: Message) {
  logMessage(message);

  // Ignore anything not in a text channel
  if (message.channel.type !== "GUILD_TEXT") {
    return;
  }

  // Ignore our own messages
  if (message.author.id === botID) {
    return;
  }

  await checkCommand(message, adminIDs);
  await autoStartThread(message, questionChannelID);
}

function logMessage(message: Message) {
  const channelName =
    message.channel.type === "DM" ? "DM" : `#${message.channel.name}`;

  console.log(
    `[${channelName}] <${message.author.username}#${message.author.discriminator}> ${message.content}`,
  );
}

async function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState) {
  const { guild } = newState;
  const userID = newState.id;
  const oldChannelID = oldState.channelId;
  const newChannelID = newState.channelId;

  if (newChannelID !== null && newChannelID !== oldChannelID) {
    await onJoinedVoiceChannel(guild, userID, newChannelID);
  } else if (newChannelID === null && oldChannelID !== null) {
    await onLeftVoiceChannel(guild, oldChannelID);
  }
}

async function onJoinedVoiceChannel(
  guild: Guild,
  userID: string,
  channelID: string,
) {
  await autoCreateVoiceChannels(
    guild,
    userID,
    channelID,
    voiceCategoryID,
    voiceJoinChannelID,
  );
}

async function onLeftVoiceChannel(guild: Guild, channelID: string) {
  await autoDeleteEmptyVoiceChannels(guild, channelID);
}
