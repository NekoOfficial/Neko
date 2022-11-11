const presences = require(`${process.cwd()}/src/assets/json/presence`);
const { ActivityType } = require("discord.js")

module.exports = async client => {
  // Setup stuff
  client.manager.init(client.user.id);
  client.on("raw", d => client.manager.updateVoiceState(d));

  // Roll presences
  if (!client.dev) {
    setInterval(() => {
      const { message, type } = presences[Math.round(Math.random() * (presences.length - 1))];
			client.user.setPresence({ status: "online" });
      client.user.setActivity(message.replace(/{{guilds}}/g, client.guilds.cache.size), { type: ActivityType[type] });
    }, 180000);
  } else {
    client.user.setPresence({ status: "idle" });
    client.user.setActivity("in development mode!", { type: ActivityType.Playing });
  };

  // Post stats to Top.gg if we're not using the test bot
  if (!client.dev) {
    setInterval(async () => {
      await client.poster.post();
    }, 21600000); // 6 hours
  };
  
  // Log msg
  const channel = client.channels.cache.get(client.config.log);
  channel.send({ content: `H.. Hey sensei, I've just woke up ${client.dev ? "for your development" : "to work"}... I announced this in **${client.util.commatize(client.guilds.cache.size)}** servers, to **${client.util.commatize(client.guilds.cache.reduce((a, b) => a + b.memberCount, 0))}** fellow users and reloaded **${client.commands.size}** commands!` })
    .catch(() => {});
};
