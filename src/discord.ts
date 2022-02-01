import { Client, Guild, Intents, Message, VoiceState } from "discord.js";
import {
  autoCreateVoiceChannels,
  renameAllChannelsAccordingToOrder,
} from "./autoCreateVoiceChannels";
import { autoDeleteEmptyVoiceChannels } from "./autoDeleteEmptyVoiceChannels";
import { autoStartThread } from "./autoStartThread";
import { checkCommand } from "./command";
import { getGuildByName } from "./discordUtil";
import { getChannelIDByName } from "./discordUtilChannels";
import { checkEmptyVoiceChannels } from "./onReady";
import { error, getEnvironmentVariables } from "./util";

let ready = false;
let discordClient: Client<boolean>;
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

  discordClient = new Client({
    // Intents are needed for Discord to send specific types of data
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES,
    ],
  });

  discordClient.on("ready", onReady);
  discordClient.on("messageCreate", onMessageCreate);
  discordClient.on("voiceStateUpdate", onVoiceStateUpdate);

  await discordClient.login(discordToken);
  console.log("Logging in to Discord...");
}

async function onReady(client: Client) {
  if (client.user === null || client.application === null) {
    error("Failed to connect to Discord.");
  }

  console.log(
    `Connected to Discord with a username of: ${client.user.username}`,
  );

  const guild = initDiscordVariables(client);
  await checkEmptyVoiceChannels(guild, voiceCategoryID);
  await renameAllChannelsAccordingToOrder(
    guild,
    voiceCategoryID,
    voiceJoinChannelID,
  );

  ready = true;
}

function initDiscordVariables(client: Client) {
  const guild = getGuildByName(client, serverName);
  if (guild === null) {
    error(`Failed to find Discord server: ${serverName}`);
  }
  console.log(`Connected to Discord server: ${guild.name}`);

  const categoryID = getChannelIDByName(guild, voiceCategoryName);
  if (categoryID === null) {
    error(`Failed to find the voice category of: ${voiceCategoryName}`);
  }
  voiceCategoryID = categoryID;

  const voiceChannelID = getChannelIDByName(guild, voiceJoinChannelName);
  if (voiceChannelID === null) {
    error(`Failed to find the voice channel of: ${voiceJoinChannelName}`);
  }
  voiceJoinChannelID = voiceChannelID;

  const textChannelID = getChannelIDByName(guild, questionChannelName);
  if (textChannelID === null) {
    error(`Failed to find the text channel of: ${questionChannelName}`);
  }
  questionChannelID = textChannelID;

  // Store our user ID for later
  botID = client.user === null ? "" : client.user.id;

  return guild;
}

async function onMessageCreate(message: Message) {
  if (!ready) {
    return;
  }

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
  if (!ready) {
    return;
  }

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
  await autoDeleteEmptyVoiceChannels(
    guild,
    channelID,
    voiceCategoryID,
    voiceJoinChannelID,
  );
}

export function discordShutdown() {
  if (discordClient === undefined) {
    return;
  }

  discordClient.destroy();
}
