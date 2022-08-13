import { Client, Guild, GuildMember } from "discord.js";

export function getGuildByName(
  client: Client,
  guildName: string,
): Guild | undefined {
  const guilds = Array.from(client.guilds.cache.values());
  const matchingGuilds = guilds.filter((guild) => guild.name === guildName);
  return matchingGuilds[0];
}

export async function getMember(
  guild: Guild,
  userID: string,
): Promise<GuildMember> {
  return guild.members.fetch(userID);
}
