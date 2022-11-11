const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async (client, player, track) => {
  // Preset embed
  const preset = new EmbedBuilder().setAuthor({ name: `Control Panel` }).setDescription(`Now Playing: [${track.title}](${track.uri})`).setThumbnail(`https://img.youtube.com/vi/${track.identifier}/sddefault.jpg`).setColor("BLUE").setFooter({ text: `Use the buttons below to control the music!` });

  const b1 = new ButtonBuilder().setCustomId("vdown").setEmoji("🔉").setStyle(ButtonStyle.Secondary);
  const b2 = new ButtonBuilder().setCustomId("stop").setEmoji("⬜").setStyle(ButtonStyle.Danger);
  const b3 = new ButtonBuilder().setCustomId("pause").setEmoji("⏸️").setStyle(ButtonStyle.Secondary);
  const b4 = new ButtonBuilder().setCustomId("skip").setEmoji("⏭️").setStyle(ButtonStyle.Secondary);
  const b5 = new ButtonBuilder().setCustomId("vup").setEmoji("🔊").setStyle(ButtonStyle.Secondary);
  const b6 = new ButtonBuilder().setCustomId("qloop").setEmoji("🔁").setStyle(ButtonStyle.Secondary);
  const b7 = new ButtonBuilder().setCustomId("sloop").setEmoji("🔂").setStyle(ButtonStyle.Secondary);

  const buttons = new ActionRowBuilder().addComponents(b1, b5, b6, b7);
  const buttons2 = new ActionRowBuilder().addComponents(b2, b3, b4);

  let NowPlaying = await client.channels.cache.get(player.textChannel).send({ embeds: [preset], components: [buttons, buttons2] });
  player.setNpMessage(NowPlaying);

  const collector = NowPlaying.createMessageComponentCollector({
    filter: b => {
      if (b.guild.members.me.voice.channel && b.guild.members.me.voice.channelId === b.member.voice.channelId) return true;
      else {
        b.reply({
          content: `Baka, you are not connected to ${b.guild.members.me.voice.channel} to use these buttons.`,
          ephemeral: true
        });
        return false;
      }
    },
    time: track.duration
  });
  collector.on("collect", async i => {
    // Defer the reply in case Lavalink responds longer than expected
    await i.deferReply({
      ephemeral: false
    });
    // Begin the collection
    if (i.customId === "vdown") {
      if (!player) {
        return collector.stop();
      }
      let amount = Number(player.volume) - 10;
      await player.setVolume(amount);
      i.editReply({
        content: `H.. hey there, the current volume is now **${amount}%**`
      });
    } else if (i.customId === "stop") {
      if (!player) {
        return collector.stop();
      }
      (await player.stop()) && player.queue.clear();
      return collector.stop();
    } else if (i.customId === "pause") {
      if (!player) {
        return collector.stop();
      }
      player.pause(!player.paused);
      const text = player.paused ? `**paused**` : `**resumed**`;
      const reply = text === "**paused**" ? `I guess you're trying to go away, huh? You told me to **pause** the song and now I will have to wait for you, haiyaa.` : `Uoooo, welcome back! I've **resumed** your song at the point you told me to pause~!`;
      i.editReply({ content: reply });
    } else if (i.customId === "skip") {
      if (!player) {
        return collector.stop();
      }
      await player.stop();
      const reply = (track.length = 1 ? `` : `I.. I think you don't like this song? O.. Okay, I'll move on to the next song then`);
      if (track.length === 1) { /* do nothing */ } else i.editReply({ content: reply });
      if (track.length === 1) {
        return collector.stop();
      }
    } else if (i.customId === "vup") {
      if (!player) {
        return collector.stop();
      }
      let amount = Number(player.volume) + 10;
      if (amount >= 150)
        return i.editReply({
          content: `Baka, you want to earrape yourself? I won't allow that kind of thing to happen, ~~although I want to~~ my sensei told me not to earrape people!`
        });
      await player.setVolume(amount);
      i.editReply({
        content: `H.. hey there, the current volume is now **${amount}%**`
      });
      return;
    } else if (i.customId === "qloop") {
      if (!player) {
        return collector.stop();
      }
      if (!player.queue.size)
        return await i.editReply({
          content: `No more songs in the queue to loop, baka. Or did you mean the song repeat button?`
        });
      if (player.queueRepeat) {
        player.setQueueRepeat(false);
        return await i.editReply({
          content: `This will be the last time you listen to this whole queue, huh? Well then, have a good time.`
        });
      } else {
        player.setQueueRepeat(true);
        return await i.editReply({
          content: `I'm glad that you're willing to stay a bit longer! I've **enabled** the **queue** loop and you can enjoy yourself with a cup of tea~!`
        });
      }
    } else if (i.customId === "sloop") {
      if (!player) {
        return collector.stop();
      }
      if (player.trackRepeat) {
        player.setTrackRepeat(false);
        return await i.editReply({
          content: `I assume you got bored listening to this song again and again, so maybe let me turn off the loop for you.`
        });
      } else {
        player.setTrackRepeat(true);
        return await i.editReply({
          content: `You like this song? I'm willing to loop it for you, just for your staying~!`
        });
      }
    } else if (i.customId === "ncore") {
      if (!player) {
        return collector.stop();
      }
      await player.stop();
      const reply = track.length === 1 ? `` : `I.. I think you don't like this song? O.. Okay, I'll move on to the next song then`;
      if (track.length === 1) { /* do nothing */ } else i.editReply({ content: reply });
      if (track.length === 1) {
        return collector.stop();
      }
    }
  });
};
