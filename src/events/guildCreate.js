const { PermissionsBitField } = require("discord.js")

module.exports = async (client, guild) => {
  if (!guild.available) return;

  const channel = client.channels.cache.get("864096602952433665");

  if (!guild.owner && guild.ownerId) await guild.members.fetch(guild.ownerId);

  // If the guild exists in the settings then definitely an unavailable guild came back.
  const exists = client.settings.guild.cache.has(guild.id);

  let content; exists ? 
    // Exclude us from this message
    content = `Oh, **${guild.name}** with **${guild.memberCount - 1}** members got summoned again from eternal slumber. They must be happy.` : 
    // And exclude "someone" too for this message
    content = `Ooh, I got invited to a new party! Someone thrown me into **${guild.name}** which has **${guild.memberCount - 2}** other people in it!`
  if (client.user.settings.guildBlacklist.includes(guild.id)) {
    // Add a twist for blacklisted guilds
    content += `\nBut oh, they're blacklisted. Got to go, take note of this, sensei!`
    await guild.leave();
  }

  if (channel) await channel.send({ content }).catch(() => null);

  const join = guild.channels.cache.find(c => c.type === "text" && c.permissionsFor(c.guild.members.me).has(PermissionsBitField.Flags.ViewChannel) && c.permissionsFor(c.guild.members.me).has(PermissionsBitField.Flags.SendMessages));
  if (!join) return;

  return join.send(["H-Hey, thanks for inviting me in to this wonderful server.", `Start by typing \`/\` to get a list of commands.`, `If you found any bugs, please report them! You can join our support server [here](https://discord.gg/bJemK26) or DM \`Akira#8853\`!`, "", `If you still have any questions, ask them in our server too! There'll be a command for this very soon after!`, "", "Have a great day!"].join("\n")).catch(() => null);
};
