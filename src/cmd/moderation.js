const { EmbedBuilder, PermissionsBitField, GuildEmoji } = require("discord.js");
const Command = require("../struct/cmd/Command");
const { modImports } = require("../util/imports");

module.exports = class Mod extends Command {
  constructor(client) {
    super(client, {
      data: modImports,
      cooldown: 1000
    })
  }
  async run(client, i) {
    // Default values that'll occur literally everywhere
    const user = i.options.getMember("member");
    const reason = i.options.getString("reason") || "None";
    // Defer the reply and get the subcommand
    await i.deferReply();
    const sub = i.options.getSubcommand();
    // if-else to prevent stuff being reused
    if (sub == "warn") {
      // First, safety step
      if (!user.settings) user.update({ infraction: 0, infraction_data: [] });
      // Increment base
      const increment = user.settings.infraction + 1;
      // Check if user is actually valid
      // Preventing dead case like a sudden leave - leaves a huge mistake behind.
      if (!user) return i.editReply({ content: "Hey, they're not here. I can't see them around!" });
      // Now check if the specified user is actually the author
      if (user.id == i.member.user.id) return i.editReply({ content: "Baka, don't you dare. You're a weird person." });
      // Now check if the specified user is actually the guild owner
      if (user.id == i.guild.ownerId) return i.editReply({ content: "You baka, that's not a funny joke! You can't do that!" });
      // Now check if the specified user has a higher position than them
      if ((await i.guild.members.fetch(i.user.id)).roles.highest.position <= user.roles.highest.position) return i.editReply({ content: "Hey, you can't warn someone who has a higher or equal position than you, baka." });
      // Now check if the specified user is a bot
      if ((await i.guild.members.fetch(user.id)).bot) return i.editReply({ content: "I don't see why bots need to be punished! Don't do that!" });
      // Now check if the specified user is... itself
      if (user.id == client.user.id) return i.editReply({ content: "You dare?!" });

      // To the reason field
      // Honestly let's just limit the length - no need to check for gibberish content
      // It could be a joke, right?
      if (reason < 5 || reason > 500) return i.editReply({ content: "Hey, please maintain a reasonable length for the reason! The current limit is `more than 5 and less than 500 characters`." });
      // Now try to save "the thing"
      const warnObj = (user.settings.infraction_data).concat([{ infractionBy: i.member.user.id, reason: reason, type: "WARN", at: Math.round(+new Date / 1000) }]);
      await user.update({ infraction: increment, infraction_data: [...new Set(warnObj)] }).then(() => {
        // Confirm the update info
        (i.member.user.id == user.settings.infraction_data[0].infractionBy) ?
          (i.options.getBoolean("notify")) ?
            i.editReply({ content: `<@${user.id}>, this is your **${client.util.ordinalize(user.settings.infraction)}** infraction! You've been **warned** by **${i.member.user.tag}** for this reason:\n\n\`\`\`fix\n${reason}\`\`\`` }) :
            i.editReply({ content: `Because you said no to notification, I'm not going to notify them!\n\nBy the way, they're having their **${client.util.ordinalize(user.settings.infraction)} warning**.` }).then(msg => setTimeout(() => msg.delete(), 5000)) :
          i.editReply({ content: "Oh... database said no to information saving, so you might have to do that again.\n\n||Issue didn't resolve in an hour? Use `/bot feedback` to notice my sensei!||" })
      });
    // This is equivalent to "mute" - what we used to do before timeout released.
    // Discord handled a HUGE part of this command, so I love this feature and will use it instead of muting
    } else if (sub == "timeout") {
      const time = i.options.getInteger("time") * 60000;
      // If time is less than 0 or more than 28 days
      if (0 > time > (40320 * 60000)) return i.editReply({ content: "That's not a valid time, baka. Set something between **1 minute** and **40,320 minutes (28 days)**." });
      // Now off we go to the basic steps
      // Increment base
      const increment = user.settings.infraction + 1;
      // Check if user is actually valid
      // Preventing dead case like a sudden leave - leaves a huge mistake behind.
      if (!user) return i.editReply({ content: "Hey, they're not here. I can't see them around!" });
      // Now check if the specified user is actually the author
      if (user.id == i.member.user.id) return i.editReply({ content: "Baka, don't you dare. You're a weird person." });
      // Now check if the specified user is actually the guild owner
      if (user.id == i.guild.ownerId) return i.editReply({ content: "You baka, that's not a funny joke! You can't do that!" });
      // Now check if the specified user has a higher position than them
      if ((await i.guild.members.fetch(i.user.id)).roles.highest.position <= user.roles.highest.position) return i.editReply({ content: "Hey, you can't do that to someone who has a higher position than you, baka." });
      // Now check if the specified user is a bot
      if ((await i.guild.members.fetch(user.id)).bot) return i.editReply({ content: "I don't see why bots need to be punished! Don't do that!" });
      // Now check if the specified user is... itself
      if (user.id == client.user.id) return i.editReply({ content: "You dare?!" });

      // To the reason field
      // Honestly let's just limit the length - no need to check for gibberish content
      // It could be a joke, right?
      if (reason < 5 || reason > 500) return i.editReply({ content: "Hey, please maintain a reasonable length for the reason! The current limit is `more than 5 and less than 500 characters`." });
      // Now try to save "the thing"
      // First, safety step
      // Initialize the user settings in the database first if it doesn't exist yet
      if (!user.settings) user.update({ infraction: 0, infraction_data: [] });
      const muteObj = (user.settings.infraction_data).concat([{ infractionBy: i.member.user.id, reason: reason, type: "TIMEOUT", at: Math.round(+new Date / 1000) }]);
      await user.update({ infraction: increment, infraction_data: [...new Set(muteObj)] }).then(() => {
        // Confirm the update info
        (i.member.user.id == user.settings.infraction_data[0].infractionBy) ?
          i.editReply({ content: `<@${user.id}>, this is your **${client.util.ordinalize(user.settings.infraction)}** infraction! You've been **timed out** by **${i.member.user.tag}** for this reason:\n\n\`\`\`fix\n${reason + `, for ${time / 60000} minute(s).`}\`\`\`` }) :
          i.editReply({ content: "Oh... database said no to information saving, so you might have to do that again.\n\n||Issue didn't resolve in an hour? Use `/bot feedback` to notice my sensei!||" })
      });
      // We do this after confirmation to avoid dead cases
      user.timeout(time, reason);
    } else if (sub == "untimeout") {
      // Check if user is actually valid
      if (!user) return i.editReply({ content: "Hey, they're not here. I can't see them around!" });
      // Now check if the specified user is actually the guild owner
      if (user.id == i.guild.ownerId) return i.editReply({ content: "Baka, you can't even time out them." });
      // Now check if the specified user has a higher position than them
      if ((await i.guild.members.fetch(i.user.id)).roles.highest.position <= user.roles.highest.position) return i.editReply({ content: "It's just that you can't - you can't help them because their role is higher." });
      // Now check if they're timed out
      // W... What a long name though
      if (!user.communicationDisabledUntilTimestamp) return i.editReply({ content: "Baka, they're not timed out." });

      user.timeout(null).then(() => {
        i.editReply({ content: `Removed timeout for <@${user.id}>!` })
      })
    } else if (sub == "ban") {
      // First, safety step
      if (!user.settings) user.update({ infraction: 0, infraction_data: [] });
      // Increment base
      const increment = user.settings.infraction + 1;
      // Check if user is actually valid
      if (!user) return i.editReply({ content: "Hey, they're not here. I can't see them around!" });
      // Now check if the specified user is actually the author
      if (user.id == i.member.user.id) return i.editReply({ content: "Baka, don't you dare. You're a weird person." });
      // Now check if the specified user is actually the guild owner
      if (user.id == i.guild.ownerId) return i.editReply({ content: "You baka, that's not a funny joke! You can't do that!" });
      // Now check if the specified user has a higher position than them
      if ((await i.guild.members.fetch(i.user.id)).roles.highest.position <= user.roles.highest.position) return i.editReply({ content: "Hey, you can't ban someone who has a higher position than you, baka." });
      // Now check if the specified user is a bot
      if ((await i.guild.members.fetch(user.id)).bot) return i.editReply({ content: "I don't see why bots need to be punished! Don't do that!" });
      // Now check if the specified user is... itself
      if (user.id == client.user.id) return i.editReply({ content: "You dare?!" });

      // Check for permission
      if (!i.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return i.editReply({ content: "Hey, you don't have permissions to do that, you baka." });

      // To the reason field
      // Honestly let's just limit the length - no need to check for gibberish content
      // It could be a joke, right?
      if (reason < 5 || reason > 500) return i.editReply({ content: "Hey, please maintain a reasonable length for the reason! The current limit is `more than 5 and less than 500 characters`." });
      user.ban({ reason: reason });
      // Now try to save "the thing"
      const banObj = (user.settings.infraction_data).concat([{ infractionBy: i.member.user.id, reason: reason, type: "BAN", at: Math.round(+new Date / 1000) }]);
      await user.update({ infraction: increment, infraction_data: [...new Set(banObj)] }).then(() => {
        // Confirm the update info
        (i.member.user.id == user.settings.infraction_data[0].infractionBy) ?
          user.send({ content: `<@${user.id}>, you've been **banned** from **${i.guild.name}** by **${i.member.user.tag}** for this reason:\n\n\`\`\`fix\n${reason}\`\`\`` }).then(() => i.editReply({ content: `Hammer has been thrown to <@${user.id}>. Lift it up sometime, sad to see them go.` })) :
          i.editReply({ content: "Oh... database said no to information saving, but they should be banned.\n\n||This database error didn't resolve in an hour? Use `/bot feedback` to notice my sensei!||" })
      });
    } else if (sub == "clear") {
      // Uh shortcut
      const { channel } = i;
      const amount = i.options.getInteger("number");
      // Check case
      if (amount < 0 || amount > 99) return i.editReply({ content: "Baka, limit is 99. The least you can do is 1." });
      // Fetch messages
      await channel.bulkDelete(amount, true).then(msg => {
        i.channel.send({ content: `Cleared **${msg.size}** messages from this channel.` }).then(m => setTimeout(() => m.delete(), 5000));
      })
    } else if (sub == "clone") {
      const channel = i.options.getChannel("channel");
      if ([i.guild.systemChannelId, i.guild.rulesChannelId, i.guild.publicUpdatesChannelId].includes(channel.id)) return i.editReply({ content: "Baka, that's a special channel. I can't clone that one!\n\n||**Special types of channel:** System, Rule and Public Update.||" })
      const message = await i.editReply({ content: "I'm doing some job in the background, go get a cup of tea and wait until I respond again!" });
      const data = await channel.delete().catch(() => { });
      if (!data) return i.editReply({ content: "O.. Oh, something went wrong. I can't delete that channel.\n\nThis issue happens everywhere? **a)** Reconfigure my permissions!; **b)** Notice my sensei using `/bot feedback`!||" });
      const perm = await data.permissionOverwrites.cache;
      const newChannel = await i.guild.channels.create({
        name: `${data.name}`,
        type: data.type,
        position: data.rawPosition ?? data.position,
        topic: data.topic ?? null,
        nsfw: data.nsfw ?? null,
        bitrate: data.bitrate ?? null,
        userLimit: data.userLimit ?? null,
        parent: (await i.guild.channels.fetch(data.parentId)) ? data.parentId : null,
        permissionOverwrites: perm ?? [],
        rateLimitPerUser: data.rateLimitPerUser ?? null,
        defaultAutoArchiveDuration: data.defaultAutoArchiveDuration ?? null,
        rtcRegion: data.rtcRegion ?? null,
        videoQualityMode: data.videoQualityMode ?? null,
        reason: `${i.user.tag}: channel clone`,
      });
      const date = Math.floor(+new Date / 1000);
      if (i.guild.channels.cache.get(message.channelId)) await i.deleteReply();
      newChannel.send({ content: `*This channel was cloned. Requested by **${i.member.user.tag}**, on **<t:${date}:F>***` })
    } else if (sub == "infractions") {
      if (!client.db) return i.editReply({ content: "O-Oh, the database isn't connected. Maybe try again later?" })
      if (!user) /* Safety check */ return i.editReply({ content: "O-Oh, I can't find that user! Have they gone somewhere?" });
      if (user.settings.infraction == 0) return i.editReply({ content: "Aww, good user. They haven't had a single infraction in here." });
      let n = 0;
      const map = (user.settings.infraction_data.reverse()).map(x => `**#${++n}:** ${client.util.toProperCase(x.type.toLowerCase())}\n**Executed by:** ${(client.users.cache.get(x.infractionBy)).tag}\n**Reason:** ${client.util.truncate(x.reason, 100, "...")}\n**At:** ${x.at ? `<t:${x.at}:F>` : "Unknown time"}`)
      const paginate = client.util.page(map, 5); // For specific paginations like this use a simpler utility
      let { results, page, pages } = paginate;
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${user.user.tag}'s rapsheet` })
        .setThumbnail(user.displayAvatarURL())
        .setDescription(`*Order type: Youngest to oldest infractions.*\n\n${results[page - 1]}`)
        .setColor("#fcff57")
        .setFooter({ text: `Wild cats should be trained! | Page ${page} of ${pages}`, iconURL: i.member.user.displayAvatarURL() })
      const msg = await i.editReply({ embeds: [embed] });
      if (pages == 1) return;
      const prev = '◀'; const next = '▶'; const terminate = '❌';

      const filter = (_, user) => user.id === i.member.user.id;
      const collector = msg.createReactionCollector(filter);
      const navigators = [prev, next, terminate];
      let timeout = setTimeout(() => collector.stop(), 90000);

      for (let i = 0; i < navigators.length; i++) {
        await msg.react(navigators[i]);
      };

      collector.on('collect', async reaction => {
        switch (reaction.emoji.name) {
          case prev instanceof GuildEmoji ? prev.name : prev: page--; break;
          case next instanceof GuildEmoji ? next.name : next: page++; break;
          case terminate instanceof GuildEmoji ? terminate.name : terminate: collector.stop(); break;
        };
        if (page <= 0) { page = pages } else if (page > pages) { page = 1 };
        embed.setDescription(`*Sort mode: Youngest to oldest infractions.*\n\n${results[page - 1]}`).setFooter({ text: `Wild cats should be trained! | Page ${page} of ${pages}`, iconURL: i.member.user.displayAvatarURL() });
        await msg.edit({ embeds: [embed] });
        await reaction.users.remove(i.member.user.id);
        timeout.refresh();
      });
      collector.on('end', async () => await msg.reactions.removeAll());
    } else if (sub == "kick") {
      // First, safety step
      if (!user.settings) user.update({ infraction: 0, infraction_data: [] });
      // Increment base
      const increment = user.settings.infraction + 1;
      // Check if user is actually valid
      if (!user) return i.editReply({ content: "Hey, they're not here. I can't see them around!" });
      // Now check if the specified user is actually the author
      if (user.id == i.member.user.id) return i.editReply({ content: "Baka, don't you dare. You're a weird person." });
      // Now check if the specified user is actually the guild owner
      if (user.id == i.guild.ownerId) return i.editReply({ content: "You baka, that's not a funny joke! You can't do that!" });
      // Now check if the specified user has a higher position than them
      if ((await i.guild.members.fetch(i.user.id)).roles.highest.position <= user.roles.highest.position) return i.editReply({ content: "Hey, you can't kick someone who has a higher position than you, baka." });
      // Now check if the specified user is a bot
      if ((await i.guild.members.fetch(user.id)).bot) return i.editReply({ content: "I don't see why bots need to be punished! Don't do that!" });
      // Now check if the specified user is... itself
      if (user.id == client.user.id) return i.editReply({ content: "You dare?!" });

      // Check for permission
      if (!i.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return i.editReply({ content: "Hey, you don't have permissions to do that, you baka." });

      // To the reason field
      // Honestly let's just limit the length - no need to check for gibberish content
      // It could be a joke, right?
      if (reason < 5 || reason > 500) return i.editReply({ content: "Hey, please maintain a reasonable length for the reason! The current limit is `more than 5 and less than 500 characters`." });
      user.kick({ reason: reason });
      // Now try to save "the thing"
      const kickObj = (user.settings.infraction_data).concat([{ infractionBy: i.member.user.id, reason: reason, type: "KICK", at: Math.round(+new Date / 1000) }]);
      await user.update({ infraction: increment, infraction_data: [...new Set(kickObj)] }).then(() => {
        // Confirm the update info
        (i.member.user.id == user.settings.infraction_data[0].infractionBy) ?
          user.send({ content: `<@${user.id}>, you've been **kicked** from **${i.guild.name}** by **${i.member.user.tag}** for this reason:\n\n\`\`\`fix\n${reason}\`\`\`` }).then(() => i.editReply({ content: `Well, that was a pretty painful kick. <@${user.id}>, sad to see you go.` })) :
          i.editReply({ content: "Oh... database said no to information saving, but they should be kicked.\n\n||This database error didn't resolve in an hour? Use `/bot feedback` to notice my sensei!||" })
      });
    } else if (sub == "unban") {
      const userID = i.options.getString("id");
      if (isNaN(userID)) return i.editReply({ content: "You baka, that's not a valid ID." });
      await client.users.fetch(userID).catch(() => {
        return i.editReply({ content: "O-Oh, I can't find that user. Maybe check your input?" });
      });
      let banned = await i.guild.bans.fetch(userID).catch(() => { });
      if (!banned) return i.editReply({ content: "Baka, they're not banned." });
      await i.guild.members.unban(userID);
      const date = Math.floor(+new Date / 1000); const user = await client.users.fetch(userID)
      i.editReply({ content: `**${user.username + "#" + user.discriminator}** has been unbanned by **${i.member.user.tag}** on <t:${date}:F>.` })
    } else if (sub == "unwarn") {
      // Get the option
      const type = i.options.getString("type");
      const index = (i.options.getInteger("index"));
      // Check if user is actually valid
      if (!user) return i.editReply({ content: "Hey, they're not here. I can't see them around!" });
      // Safety step
      if (!user.settings) return i.editReply({ content: "They... they have no data. That means they have no infractions, baka." });
      // Now check if the specified user is actually the author
      const patheticResponses /* Yes. */ = ["Cry about it.", "If you really want it, ask a moderator.", "oHoHoHoH, yOu cAn'T. Ask someone else who can do it!"]
      if (user.id == i.member.user.id) return i.editReply({ content: `Baka, you can't help yourself.\n\n||${patheticResponses[Math.floor(Math.random() * patheticResponses.length)]}||` });
      // Now check if the specified user is actually the guild owner
      if (user.id == i.guild.ownerId) return i.editReply({ content: "You baka, an owner can't be warned." });
      // Now check if the specified user has a higher position than them
      if ((await i.guild.members.fetch(i.user.id)).roles.highest.position <= user.roles.highest.position) return i.editReply({ content: "It's just that you can't. You can't help them." });
      // Now check if the specified user is a bot
      if ((await i.guild.members.fetch(user.id)).bot) return i.editReply({ content: "Baka, bots can't be warned! They did nothing wrong! >.<" });
      // Now check if the specified user is... itself
      if (user.id == client.user.id) return i.editReply({ content: "Heh, you can't warn me by me.\n\nWait, that sounds wrong. You can't, can you?" });
      // Uhhh safety check
      if (user.settings.infraction == 0) return i.editReply({ content: "Aww, good user. They have no infractions." }).then(msg => setTimeout(() => msg.edit({ content: "Aww, good user. They have no infractions.\n\nBut why did you do this anyway, you baka?" }), 3000));
      // Main stuff, go
      switch (type) {
        case "one":
          if (!index) return i.editReply({ content: "Read, you have to specify the index option.\n\n**General tip:** Do \`/moderation infractions [member]\` to get a full list of their infractions!" })
          if (index < 1 || index > user.settings.infraction) return i.editReply({ content: `Baka, specify an index between **1** and **${user.settings.infraction}**.\n\n**General tip:** Do \`/moderation infractions [member]\` to get a full list of their infractions!` });
          const infractionList = user.settings.infraction_data.reverse();
          const apprIndex = index - 1;
          await infractionList.splice(apprIndex, 1);
          await user.update({ infraction: (user.settings.infraction - 1), infraction_data: [...new Set(infractionList)] }).then(() => {
            // Confirm the update info
            // This method waste time but we're not bothered to make a better function for now.
            (JSON.stringify(user.settings.infraction_data) == JSON.stringify(infractionList)) ?
              i.editReply({ content: `Removed the **${client.util.ordinalize(index)} infraction** from <@${user.id}>'s rapsheet.` }) :
              i.editReply({ content: "Oh... database said no to information saving, so you might have to do that again.\n\n||Issue didn't resolve in an hour? Use `/bot feedback` to notice my sensei!||" })
          });
          break;
        case "all":
          const msg = await i.editReply({ content: `Are you sure you want to delete **${user.settings.infraction} infractions** from <@${user.id}>'s rapsheet?\n\n*This cannot be undone.*` })
          const yes = '✅'; const no = '❌';

          const filter = (_, user) => user.id === i.member.user.id;
          const collector = msg.createReactionCollector(filter);
          const navigators = [yes, no];
          setTimeout(() => collector.stop(), 90000);

          for (let i = 0; i < navigators.length; i++) {
            await msg.react(navigators[i]);
          };

          collector.on('collect', async reaction => {
            switch (reaction.emoji.name) {
              case yes: 
                await user.update({ infraction: 0, infraction_data: [] });
                await msg.edit({ content: `Successfully removed **all infractions** from <@${user.id}>'s rapsheet.` });
                collector.stop();
              break;
              case no: 
                collector.stop();
                msg.edit({ content: "Cancelled the operation." });
              break;
            };
            await msg.reactions.removeAll();
          });
          collector.on('end', async () => await msg.reactions.removeAll());
          break;
      }
    }
  }
}
