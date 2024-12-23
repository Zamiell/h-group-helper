import type { Message } from "discord.js";
import { sendDMWithDeletedMessage } from "./discordUtils.js";

export async function sendNotHGroupDM(message: Message): Promise<void> {
  const dmMessage =
    'Your post in the [convention-proposals](<https://discord.com/channels/140016142600241152/1289276242495017061>) forum has been deleted because you do not have the "H-Group" role. Do you regularly play pick-up games in this Discord server using the voice channels? If so, please send a direct message to a moderator to request the "H-Group" role. You can find the current list of moderators in the [#role-explanations](<https://discord.com/channels/140016142600241152/930525271780638791/930696130579283978>) channel.';
  await sendDMWithDeletedMessage(message.author, dmMessage, message.content);
}
