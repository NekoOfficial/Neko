const Command = require(`${process.cwd()}/src/struct/cmd/Command`);
const { SlashCommandBuilder } = require("discord.js");
const responses = [
  "Oh, forgot to tell you - the length is `{{length}}`. Remind me to do this next time!",
  "Heya, didn't tell you the length - it's `{{length}}`.",
  "Baka, here's what you will need: this thing will last for `{{length}}`.",
  "Perhaps stay a bit more after `{{length}}`? I'm lonely.",
  "This thing has a length of `{{length}}` - I remember it!",
  "Oh, I've heard this before! It's um, as long as `{{length}}`."
]
const { PermissionsBitField } = require("discord.js");

module.exports = class Music extends Command {
  constructor(client) {
    super(client, {
      data: new SlashCommandBuilder()
        .setName("music")
        .setDescription("Basic music commands.")
        .addSubcommand(cmd => cmd
          .setName("play")
          .setDescription("Play a song.")
          .addStringOption(option => option.setName("input").setDescription("URL or name of the song").setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName("filter")
          .setDescription("Set a music filter, or clear them.")
          .addStringOption(option => option
            .setName("name")
            .setDescription("name of the filter.")
            .setRequired(true)
            .addChoices(...[
              { name: "clear", value: "c" },
              { name: "bass", value: "b" },
              { name: "nightcore", value: "nc" },
              { name: "pitch", value: "p" },
              { name: "distort", value: "d" },
              { name: "8d", value: "8d" },
              { name: "bassboost", value: "bb" },
              { name: "speed", value: "dt" },
              { name: "vaporwave", value: "vp" }
            ])
          )
        ),
      usage: "music <command>",
      category: "music",
      permissions: ["Use Application Commands", "Send Messages", "Embed Links"]
    });
  }
  async run(client, i) {
    await i.deferReply();
    // Get the subcommand
    const sub = i.options.getSubcommand()
    // Have to use if... else here to avoid messing up
    if (sub == "play") {
      // Get the channel
      const { channel } = i.member.voice;
      // Handle cases.
      if (!channel) return i.editReply("You're not in a voice channel, baka.");
      if (!i.guild.members.me.permissions.has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak]))
        return i.editReply({
          content: `Hey you, I don't have enough permissions to execute this command, baka! Give me these \`CONNECT\` and \`SPEAK\` permissions, will you?`
        });
      if (!i.guild.members.me.permissionsIn(channel).has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak]))
        return i.editReply({
          content: `Hey you, I don't have enough permissions to execute this command, baka! Give me these \`CONNECT\` and \`SPEAK\` permissions, will you?`
        });
    
      const emojiplaylist = "🎶";
      let search = i.options.getString("input");
      let res;
        
      // Roll the responses
      const pick = Math.floor(Math.random() * 6); // Add more
    
      let player = client.manager.create({
        guild: i.guildId,
        textChannel: i.channelId,
        voiceChannel: i.member.voice.channelId,
        selfDeafen: true,
        volume: 65 // Avoid earraping on start
      });
    
      if (player.state != "CONNECTED") await player.connect();
    
      try {
        res = await player.search(search);
        if (res.loadType === "LOAD_FAILED") {
          if (!player.queue.current) player.destroy();
          return await i.editReply({
            content: `Oh no, I'm s.. sorry! Something happened while searching for the query you gave me, maybe it's sensei's fault.`
          });
        }
      } catch (err) {
        console.log(err);
      }
      switch (res.loadType) {
        case "NO_MATCHES":
          if (!player.queue.current) player.destroy();
          return await i.editReply({
            content: `I searched everywhere, but it seems like... hmmm, I didn't find anything like that. Try rephrasing that a bit?`
          });
        case "TRACK_LOADED":
          player.queue.add(res.tracks[0], i.user);
          if (!player.playing && !player.paused && !player.queue.length) player.play();
          return await i.editReply({
            content: `${emojiplaylist} I've added **[${res.tracks[0].title}](<${res.tracks[0].uri}>)** to the queue - enjoy listening!`
          })
            .then(msg => setTimeout(() => msg.channel.send({ content: responses[pick].replace(/{{length}}/g, client.util.format(player, res.tracks[0].duration)) }), 5000));
        case "PLAYLIST_LOADED":
          player.queue.add(res.tracks);
          await player.play();
          return await i.editReply({
            content: `${emojiplaylist} I've added the playlist **[${res.playlist.name}](<${search}>)** to the queue - enjoy listening!`
          })
            .then(msg => setTimeout(() => msg.channel.send({ content: responses[pick].replace(/{{length}}/g, client.util.format(player, res.playlist.duration)) }), 5000));
        case "SEARCH_RESULT":
          const track = res.tracks[0];
          player.queue.add(track);
    
          if (!player.playing && !player.paused && !player.queue.length) {
            player.play();
            return await i.editReply({
              content: `${emojiplaylist} I've added **[${track.title}](<${track.uri}>)** to the queue - enjoy listening!`
            })
              .then(msg => setTimeout(() => msg.channel.send({ content: responses[pick].replace(/{{length}}/g, client.util.format(player, track.duration)) }), 5000));
          } else {
            return await i.editReply({
              content: `${emojiplaylist} I've added **[${track.title}](<${track.uri}>)** to the queue - enjoy listening!`
            })
              .then(msg => setTimeout(() => msg.channel.send({ content: responses[pick].replace(/{{length}}/g, client.util.format(player, track.duration)) }), 5000));
          }
      }
    } else {
      const filter = i.options.getString("name");

      const player = client.manager.get(i.guildId);
      if (!player.queue.current) return i.editReply("Baka, there's nothing playing.");
    
      let response;
      switch (filter) {
        case "b":
          player.setBassboost(true);
          response = "You want some bass also? I'll go get one while the DJ guy is playing your music. Also, I've turned on bass mode for you!";
        break;
        case "eq":
          player.setEqualizer(true);
          response = "I don't know much about your music species but I've told the DJ guy to add some equalizer. Have fun~";
        break;
        case "bb":
          var bands = new Array(7).fill(null).map((_, i) => ({ band: i, gain: 0.25 }));
          player.setEQ(...bands);
          response = "Bassboost is on! Enjoy your music~!";
        break;
        case "nc":
          player.setNightcore(true);
          response = "Heck yeah! Nightcore is the filter that I like the most, because it's good imo.";
        break;
        case "p":
          player.setPitch(2);
          response = "I've changed the pitch of the song a bit, now enjoy~";
        break;
        case "d":
          player.setDistortion(true);
          response = "I̶̖̥̕ ̸͙̞͑̇t̶̖̂h̵͈̔͝i̶̠͐̿n̵͇̂k̶̘͐ ̴̯̝̈́y̷̪͗͝ő̴̬͂ͅù̷̳̦́ ̷͂ͅw̸͓̩͛à̵̬n̷̮͕̓͆t̸͈̹̊ ̵̰̓t̶͕͖̓̍ò̷̥͜ ̸̥̼̏̐d̷̦͌̃ĩ̸̘̮͠s̸̛̬̪t̴̬̍o̵̼̾ṟ̵͙̐t̶͚̟͒ ̵̱́t̶̼̿̊͜h̶̘͈́̆ẽ̶͖̣ ̸̨̪̊̽s̷͎̹͊o̵͓͚̎̏n̶̥͂g̶͖̘̓ ̴͓͉̓l̵̫͋̿ì̴̱k̶̨̀e̸̘̱͂ ̷̖͎̆w̸̺͑h̸̨͑͘a̵̓͜t̶̺͊ ̸͈̕ả̸͇̱m̸̭̔͊ ̷̜͕͌I̷̢͔̓ ̸̠͍́̀d̷̨̒o̸̦̓i̸͍̽͛n̶͇̓g̸͍̫͌ ̶̱̋h̵͚̍̅ḛ̵̇̿r̸̲̮͛̚e̸͍̅,̷̭́̈́ ̴̡̐r̵̞͂i̶̡͊g̸̡̜̍h̶̪̚t̸̢̼͑?̵̝̌̊";
        break;
        case "vp":
          player.setVaporwave(true);
          response = "Vaporwave is on, enjoy your music~!";
        break;
        case "c":
          player.clearEffects();
          response = "H.. hey, just coming here to say I've cleared all the song effects for you.";
        break;
        case "dt":
          player.setSpeed(2);
          response = "DoubleTime, heck yeah.";
        case "8d":
          player.set8D(true);
          response = "8d is now enabled! Have fun~!";
        break;
      }
      return i.editReply({ content: response });
    }
  }
}