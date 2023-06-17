const Command = require(`${process.cwd()}/src/struct/cmd/Command`);
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const moment = require("moment");
const fetch = require("node-fetch");
const urban = require("relevant-urban");
const { utilImports } = require("../util/imports");

module.exports = class Utility extends Command {
  constructor(client) {
    super(client, {
      data: utilImports,
      usage: "utility <command>",
      category: "utility",
      permissions: ["Use Application Commands", "Send Messages", "Embed Links"]
    });
  }
  async run(client, i) {
    await i.deferReply();
    // Get the subcommand
    const sub = i.options.getSubcommand();
    // Get the subcommand group
    const subGroup = i.options.getSubcommandGroup();
    if (sub == "avatar") {
      const user = i.options.getUser("member")
      // Check
      if (!user) return i.editReply({ content: "You baka, that's not a valid user." });
      // Get avatar and predefine
      const img = (s) => user.avatarURL({
        extension: "png", // Lossless
        dynamic: true,
        size: s
      });
      // Reply
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${user.properTag()}'s Avatar` })
        .setImage(img(2048)).setTimestamp().setColor("#fcff57")
        .setDescription(`Quality: [x128](${img(128)}) | [x256](${img(256)}) | [x512](${img(512)}) | [x1024](${img(1024)}) | [x2048](${img(2048)})`)
        .setFooter({ text: `Requested by ${i.member.user.properTag()}`, iconURL: i.member.user.displayAvatarURL() });
      i.editReply({ embeds: [embed] });
    } else if (sub == "banner") {
      const user = i.options.getUser("member")
      // Check
      if (!user) return i.editReply({ content: "You baka, that's not a valid user." });
      const { banner } = await user.fetch();
      if (!banner) return i.editReply({ content: "Baka, that user doesn't have a custom banner." });
      // Get banner and predefine
      const img = (s) => user.bannerURL({
        extension: "png", // Lossless
        dynamic: true,
        size: s
      });
      // Reply
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${user.properTag()}'s Banner` })
        .setImage(img(2048)).setTimestamp().setColor("#fcff57")
        .setDescription(`Quality: [x128](${img(128)}) | [x256](${img(256)}) | [x512](${img(512)}) | [x1024](${img(1024)}) | [x2048](${img(2048)})`)
        .setFooter({ text: `Requested by ${i.member.user.properTag()}`, iconURL: i.member.user.displayAvatarURL() });
      i.editReply({ embeds: [embed] });
    } else if (sub == "channel") {
      const channel = i.options.getChannel("channel");
      // Check
      if (!channel) return i.editReply({ content: "You baka, that's not a valid channel." });
      // Shortcut
      const createdAt = moment(channel.createdAt);
      const time = createdAt.from(moment());
      const date = "<t:" + Math.round(channel.createdTimestamp / 1000) + ":D>";
      // Get channel type
      let icon, type;
      switch (channel.type) {
        // Enum value
        case 0: icon = "https://i.imgur.com/IkQqhRj.png"; type = "Text Channel"; break;
        case 2: icon = "https://i.imgur.com/VuuMCXq.png"; type = "Voice Channel"; break;
        case 4: icon = "https://i.imgur.com/Ri5YA3G.png"; type = "Guild Category"; break;
        case 5: icon = "https://i.imgur.com/4TKO7k6.png"; type = "News Channel"; break;
        case 10: icon = "https://i.imgur.com/Dfu73ox.png"; type = "Threads Channel"; break;
        case 11: icon = "https://i.imgur.com/Dfu73ox.png"; type = "Threads Channel"; break;
        case 12: icon = "https://i.imgur.com/Dfu73ox.png"; type = "Threads Channel"; break;
        case 13: icon = "https://i.imgur.com/F92hbg9.png"; type = "Stage Channel"; break;
        case 14: icon = "https://i.imgur.com/Dfu73ox.png"; type = "Guild Directory"; break;
        case 15: icon = "https://i.imgur.com/q13YoYu.png"; type = "Guild Forum"; break;
      };
      // Make embed
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${channel.name}${channel.name.endsWith("s") ? "'" : "'s"} Information` })
        .setThumbnail(icon)
        .setColor("#fcff57")
        .setFooter({ text: `Requested by ${i.user.properTag()}`, iconURL: i.user.avatarURL({ dynamic: true }) })
        .setTimestamp()
        .addFields([
          { name: '• Position', value: `${channel.position + 1 == "NaN" ? channel.position + 1 : "Unknown"}` },
          { name: `• Type`, value: `${type}` },
          { name: `• Created At`, value: `${date} [\`${time}\`]` },
          { name: `• NSFW`, value: `${channel.nsfw ? "Yes" : "No"}` },
          { name: `• Slowmode`, value: `${channel.slowmode || "No Slowmode"}` },
          { name: '• Channel ID', value: `${channel.id}` },
          { name: "• Channel Topic", value: `${channel.topic || "No Topic"}` }
        ])
      // Send it
      i.editReply({ embeds: [embed] })
    } else if (sub == "github") {
      const [u, r] = (i.options.getString("name")).trim().split("/");
      // Check
      if (!u || !r) return i.editReply({ content: "Baka, follow this format: `[repo owner]/[repo name]`." });
      // API call
      const data = await fetch(`https://api.github.com/repos/${u}/${r}`).then(res => res.json());
      // Shortcut and checks
      if (!data.id) return i.editReply({ content: "Baka, that's an invalid repository." });
      const size = client.util.formatBytes(data.size);
      const license = data.license && data.license.name && data.license.url ? `[${data.license.name}](${data.license.url})` : data.license && data.license.name || "None";
      // Make embed
      const embed = new EmbedBuilder()
        .setAuthor({ name: "GitHub", iconURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' })
        .setTitle(`${data.full_name}`)
        .setURL(data.html_url)
        .setThumbnail(data.owner.avatar_url)
        .setColor("#fcff57")
        .setFooter({ text: `Requested by ${i.user.properTag()}`, iconURL: i.user.avatarURL({ dynamic: true }) })
        .setTimestamp()
        .setDescription(
          `${data.fork ? `***Forked** from **[${data.parent.full_name}](${data.parent.html_url})**.*` : "*Parent repository.*"}\n\n` +
          `**• Language:** ${data.language || "Unknown"}\n` +
          `**• Forks:** ${data.forks_count.toLocaleString()}\n` +
          `**• License:** ${license}\n` +
          `**• Open Issues:** ${data.open_issues.toLocaleString()}\n` +
          `**• Watchers:** ${data.subscribers_count.toLocaleString()}\n` +
          `**• Stars:** ${data.stargazers_count.toLocaleString()}\n` +
          `**• Size:** ${size}\n` +
          `**• Archive Status:** ${data.archived ? "Yes" : "No"}\n` +
          `**• Disabled?** ${data.disabled ? "Yes" : "No"}\n\u200b`
        )
      // Send it
      i.editReply({ embeds: [embed] })
    } else if (subGroup == "notepad") {
      const nSub = i.options.getSubcommand();
      if (nSub == "new") {
        // Check db
        if (!client.db) return i.editReply({ content: "Oh... database isn't connected. Try again later.\n\n||Issue didn't resolve in an hour? Use `/bot feedback` to notice my sensei!||" });
        const name = i.options.getString("name");
        // Check name
        if (name.length > 15) return i.editReply({ content: "Baka, 15 characters is the note's name limit." });
        const content = i.options.getString("content");
        // Check content
        if (content.length > 125) return i.editReply({ content: "Baka, 125 characters is the note's content limit." });
        // Check profane
        if (client.util.isProfane(name) || client.util.isProfane(content)) return i.editReply({ content: "Baka, I won't save that one. Fix your wordings." });
        // Save
        await i.member.user.update({ note: { name: name, content: content } }).then(() => {
          i.member.user.settings.note.name == name ?
            i.editReply({ content: "Your note has been saved~! Check it out by doing `/utility notepad view`!" }) :
            i.editReply({ content: "Oh... database said no, you might have to do that again.\n\n||Issue didn't resolve in an hour? Use `/bot feedback` to notice my sensei!||" });
        });
      } else if (nSub == "view") {
        // Shortcut
        const name = i.member.user.settings.note.name;
        const content = i.member.user.settings.note.content;
        // Check if it exists
        if (!name) return i.editReply({ content: "You baka, you have no notes to show. Set one first." });
        // Make a request
        // Long URL isn't it
        const data = await fetch(`https://www.stickynotemaker.com/gen.sticky.php?if=30a57&font=a&img=c&title=${encodeURIComponent(name)}%21&message=${encodeURIComponent(content)}&title_color=%23a0002d&message_color=%23007e1b`);
        // Make an attachment
        const attachment = new AttachmentBuilder(await data.buffer(), { name: "note.jpg" });
        // Now make our embed
        const embed = new EmbedBuilder()
          .setAuthor({ name: "Notepad" })
          .setDescription(`*This note has a content length of **${content.length}** characters.*`)
          .setImage("attachment://note.jpg").setTimestamp().setColor("#fcff57")
          .setFooter({ text: "Powered by StickyNoteMaker", iconURL: i.member.user.displayAvatarURL() });
        // Send it
        i.editReply({ embeds: [embed], files: [attachment] });
      } else if (nSub == "delete") {
        // Shortcut
        const name = i.member.user.settings.note.name;
        // Check if it exists
        if (!name) return i.editReply({ content: "You baka, you have no notes to show. Set one first." });
        // Confirm message
        const msg = await i.editReply({ content: `Are you sure you want to delete your note?\n\n*This cannot be undone.*` });
        const yes = '✅'; const no = '❌';

        const filter = (_, user) => user.id === i.member.user.id;
        const collector = msg.createReactionCollector(filter);
        const navigators = [yes, no];
        setTimeout(() => collector.stop(), 30000);

        for (let i = 0; i < navigators.length; i++) {
          await msg.react(navigators[i]);
        };

        collector.on('collect', async reaction => {
          switch (reaction.emoji.name) {
            case yes:
              await i.member.user.update({ note: { name: null, content: null } });
              await msg.edit({ content: `Successfully removed your note~!` });
              collector.stop();
              break;
            case no:
              collector.stop();
              await msg.edit({ content: "Cancelled the operation!" });
              break;
          };
          await msg.reactions.removeAll();
        });
        collector.on('end', async () => await msg.reactions.removeAll());
      }
    } else if (sub == "npm") {
      const name = i.options.getString("name");
      // API call
      const rawData = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(name)}&size=1`).then(res => res.json());
      // Make the data usable
      const data = rawData.objects[0].package;
      const score = rawData.objects[0].score;
      let maintainers = [];
      // Shortcut and checks
      if (!data || data.length < 1) return i.editReply({ content: "Baka, that's an invalid repository. Or did you make a typo?" });
      for (let n = 0; n < data.maintainers.length; n++) {
        maintainers.push("`" + data.maintainers[n].username + "`")
      };
      const keywords = data.keywords.map(k => `\`${k}\``).join(', ')
      // Make embed
      const embed = new EmbedBuilder()
        .setAuthor({ name: "npm Registry", iconURL: 'https://i.imgur.com/24yrZxG.png' })
        .setTitle(`${data.name}`)
        .setURL(`https://www.npmjs.com/package/${data.name}`)
        .setColor("#fcff57")
        .setFooter({ text: `Requested by ${i.user.properTag()}`, iconURL: i.user.avatarURL({ dynamic: true }) })
        .setTimestamp()
        .setDescription(
          `${client.util.textTruncate(data.description, 75)}\n\n` +
          `**• Version:** ${data.version || "Unknown"}\n` +
          `**• Author:** ${data.publisher.username}\n` +
          `**• Modified:** ${moment(data.date).fromNow()}\n` +
          `**• Score:** ${(score.final * 100).toFixed(1)}%\n` +
          `**• Maintainers:** ${maintainers.join(', ')}\n` +
          `**• Keywords:** ${data.keywords && data.keywords.length > 0 ? `${keywords}` : "None"}\n\u200b`
        )
      // Send it
      i.editReply({ embeds: [embed] })
    } else if (sub == "server") {
      // i'm tired so everything lowercase
      // get the owner
      const owner = await client.users.fetch(i.guild.ownerId);
      // and the icon
      const icon = i.guild.iconURL({ dynamic: true, size: 1024 }) || /* thanks EG for this imgur link */ "https://i.imgur.com/AWGDmiu.png";
      // shortcuts
      const since = moment(i.guild.createdAt).from(moment());
      // filter all channel types
      // and use enum instead of helper
      const text = i.guild.channels.cache.filter(channel => channel.type == 0).size;
      const voice = i.guild.channels.cache.filter(channel => channel.type == 2).size;
      const category = i.guild.channels.cache.filter(channel => channel.type == 4).size;
      const news = i.guild.channels.cache.filter(channel => channel.type == 5).size;
      // make the embed
      const embed = new EmbedBuilder()
        .setAuthor({ name: `${i.guild.name}`, iconURL: icon })
        .setColor("#fcff57")
        .setFooter({ text: `Requested by ${i.user.properTag()}`, iconURL: i.user.avatarURL({ dynamic: true }) })
        .setTimestamp()
        .setDescription(
          `*${i.guild.description == null ? "Server has no description." : i.guild.description}*\n\n` +
          `**• Owner:** [${owner.properTag()}](https://discord.com/users/${owner.id})\n` +
          `**• Channels:** ${text} text \| ${voice} voice \| ${category} ${category > 1 ? " categories" : " category"} \| ${news} news\n` +
          `**• Role Count:** ${i.guild.roles.cache.size}\n` +
          `**• Emoji Count:** ${i.guild.emojis.cache.size}\n` +
          `**• Created:** ${since}\n` +
          `**• Preferred Locale:** ${i.guild.preferredLocale}\n` +
          `**• Boosting:** Level ${i.guild.premiumTier}, ${i.guild.premiumSubscriptionCount} boost${i.guild.premiumSubscriptionCount > 1 ? "s" : ""}\n` +
          `**• Verification Level:** ${i.guild.verificationLevel}\n` +
          `**• Content Filter:** ${i.guild.explicitContentFilter}\n` +
          `**• AFK Channel:** ${i.guild.afkChannel ? i.guild.afkChannel.name : "None"}\n\u200b`
        )
      // now send the embed
      i.editReply({ embeds: [embed] })
    } else if (sub == "urban") {
      const query = i.options.getString("word");
      // check for nsfw
      if (client.util.isProfane(query) && !i.channel.nsfw) return i.editReply({ content: "Hey, I won't search for that! Don't tell me to check out bad words in here!" });
      // else just continue
      const definition = await urban(encodeURI(query)).catch(() => null);
      if (!definition) return i.editReply({ content: "S.. sorry! There's no definition for that one!" });
      const embed = new EmbedBuilder() 
        .setColor("#fcff57")
        .setTitle(`Definition of ${definition.word}`)
        .setURL(definition.urbanURL)
        .setFooter({ text: `Requested by ${i.user.properTag()}`, iconURL: "https://files.catbox.moe/kkkxw3.png" })
        .addFields([
          {
            name: 'Definition', value: i.channel.nsfw === true || i.channel.nsfw === undefined
            ? client.util.truncate(definition.definition)
            : client.util.truncate(client.util.clean(definition.definition), 1000)
          },{
            name: 'Examples', value: i.channel.nsfw === true || i.channel.nsfw === undefined
            ? client.util.truncate(definition.example || 'N/A')
            : client.util.truncate(client.util.clean(definition.example || 'N/A'), 1000)
          },{
            name: 'Submitted by', value: i.channel.nsfw === true || i.channel.nsfw === undefined
            ? client.util.truncate(definition.author || 'N/A', 250)
            : client.util.truncate(client.util.clean(definition.author || 'N/A'), 250)
          },{
            name: 'Profane Word?',
            value: ' Contact my sensei through the command \`/bot feedback\` and ask to blacklist the word!'
          }
        ])
      return i.editReply({ embeds: [embed] })
    }
  }
}
