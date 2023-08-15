import type { Client, Guild, GuildMember } from "discord.js";

export function getGuildByName(
  client: Client,
  guildName: string,
): Guild | undefined {
  const guilds = [...client.guilds.cache.values()];
  return guilds.find((guild) => guild.name === guildName);
}

export async function getMember(
  guild: Guild,
  userID: string,
): Promise<GuildMember> {
  return guild.members.fetch(userID);
}
