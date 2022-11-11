module.exports = async (client, guild) => {
  // If the guild went unavailable don't do anything.
  if (!guild.available) return;

  // Delete guild settings.
  await client.settings.guild.delete(guild.id).catch(() => null);

  const channel = client.channels.cache.get("864096602952433665");

  if (!channel) return;

  // Exclude "someone" and us from this message
  return channel.send({ content: `A party ended... Someone thrown me off **${guild.name}**, which had **${guild.memberCount - 2}** other people joining...` });
};
