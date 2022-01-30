import { Client, Guild, Intents, Message, VoiceState } from "discord.js";
import { autoCreateVoiceChannels } from "./autoCreate";
import {
  autoDeleteEmptyVoiceChannels,
  checkEmptyVoiceChannels,
} from "./autoDelete";
import { checkCommand } from "./command";
import { getGuild } from "./discordUtil";
import { getEnvironmentVariables } from "./util";

let serverID: string;
let pickupGameCategoryID: string;
let createVoiceChannelID: string;
let adminIDs: string[];
let botID: string;

export async function discordInit() {
  const [
    discordToken,
    discordServerID,
    pickupGameCategoryIDString,
    createVoiceChannelIDString,
    adminIDsString,
  ] = getEnvironmentVariables([
    "DISCORD_TOKEN",
    "DISCORD_SERVER_ID",
    "PICKUP_GAME_CATEGORY_ID",
    "CREATE_VOICE_CHANNEL_ID",
    "ADMIN_IDS",
  ]);
  serverID = discordServerID;
  pickupGameCategoryID = pickupGameCategoryIDString;
  createVoiceChannelID = createVoiceChannelIDString;
  adminIDs = adminIDsString.split(",");

  const client = new Client({
    intents: [Intents.FLAGS.GUILD_VOICE_STATES],
  });
  await client.login(discordToken);

  client.on("ready", onReady);
  client.on("messageCreate", onMessageCreate);
  client.on("voiceStateUpdate", onVoiceStateUpdate);
}

async function onReady(client: Client) {
  if (client.user === null || client.application === null) {
    return;
  }

  console.log(
    `Connected to Discord with a username of: ${client.user.username}`,
  );
  botID = client.user.id;

  const guild = await getGuild(client, serverID);
  await checkEmptyVoiceChannels(guild, pickupGameCategoryID);
}

async function onMessageCreate(message: Message) {
  logMessage(message);
  await checkCommand(message, botID, adminIDs);
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
    pickupGameCategoryID,
    createVoiceChannelID,
  );
}

async function onLeftVoiceChannel(guild: Guild, channelID: string) {
  await autoDeleteEmptyVoiceChannels(guild, channelID);
}
