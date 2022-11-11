const { Manager } = require("erela.js");

module.exports = function (client) {
  require("../extend/Filter");
  return new Manager({
    nodes: [
      {
        // Was to prevent discord.js v14's headers timeout
        poolOptions: {
      		headersTimeout: 60e3
    		},
        host: "lavalink.oops.wtf",
        port: 2000,
        password: "www.freelavalink.ga"
      }
    ],
    autoPlay: true,
    send(id, payload) {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    }
  });
};
