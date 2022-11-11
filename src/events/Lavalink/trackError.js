const { EmbedBuilder } = require("discord.js");

module.exports = async (client, player, manager, payload) => {
  const name = client.guilds.cache.get(player.guild).name;
  client.util.error(`Player encountered an error in \x1b[33m${name}\x1b[0m: ${payload.error}`, "[Node]");

  const channel = client.channels.cache.get(player.textChannel);
  const embed = new EmbedBuilder().setColor("RED").setDescription(`\`\`\`xl\n${payload.error}\`\`\``);
  channel.send({
    content: `O.. Oh, sorry, the DJ guy behind me is telling me that something happened, please bring this error to my sensei and she'll handle it`,
    embeds: [embed]
  });

  player.destroy();
};
