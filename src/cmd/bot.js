// Complicated file, mostly because of eval
const Command = require(`${process.cwd()}/src/struct/cmd/Command`);
// For ping
const pingmsg = ["Ugh, again? You always ask, and I tell you that I responded in **{{ms}}ms**.", "B-baka, I responded... just in **{{ms}}ms**.", "H-here you go, I responded in **{{ms}}ms**.", "Here you go, not that it was worth my time. It only took me **{{ms}}ms**.", "Is this right? I've responded in **{{ms}}ms**.", "**{{user}}**? I've responded in **{{ms}}ms**.", "**{{user}}**! You wasted **{{ms}}ms** of my time, ERGH", "D-did I do it right? I responded in **{{ms}}ms**.", "**{{user}}**, yes I'm here, and it took me **{{ms}}ms** to respond!", "**{{user}}**, why are you pinging me man! You wasted **{{ms}}ms** of my time!!", "Hey **{{user}}**, it took me **{{ms}}ms** to send this message", "You've made me **{{ms}}ms** older - just from asking.", "**{{user}}**, I've seen your message and it took me **{{ms}}ms** not to care.", "Do you know how long it took me to read that message? You pretty much wasted **{{ms}}ms** of my day!", "B-baka! I responded in **{{ms}}ms**! Are you happy now?"];
// For eval
const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { inspect } = require("util");
const fetch = require("node-fetch");
const { botImports } = require("../util/imports");

module.exports = class Eval extends Command {
  constructor(client) {
    super(client, {
      data: botImports,
      usage: "eval",
      category: "owner",
      permissions: ["Use Application Commands", "Send Messages", "Embed Links"]
    });
  }
  async run(client, i) {
    // Defer our reply for some commands
    await i.deferReply();
    // Get the query
    const query = i.options.getString("query");
    // Now get our subcommand
    const sub = i.options.getSubcommand();
    // Use switch-case-break:
    switch (sub) {
      // "ping" command
      case "ping":
        const pick = Math.floor(Math.random() * 15); // Random the picks
        await i.editReply("Ping?").then(msg =>
          msg.edit({ content: pingmsg[pick].replace(/{{user}}/g, i.guild ? i.member.displayName : i.user.username).replace(/{{ms}}/g, `${Math.round(client.ws.ping)}`) })
        )
        break;
      // "eval" command - annoying thing that actually exist.
      case "eval":
        // Check the ID: only me can use it!
        if (!client.config.owners.includes(i.user.id)) return i.editReply({ content: "You do not have permission to use this command!" });
        // Now we try to evaluate the input
        try {
          let evaled = eval(query);
          let raw = evaled;
          let promise, output, bin, download, type, color;

          if (evaled instanceof Promise) {
            promise = await evaled.then(res => {
              return {
                resolved: true,
                body: inspect(res, { depth: 0 })
              };
            })
              .catch(err => {
                return {
                  rejected: true,
                  body: inspect(err, { depth: 0 })
                };
              });
          }

          if (typeof evaled !== "string") { evaled = inspect(evaled, { depth: 0 }); }

          if (promise) { output = client.util.clean(promise.body) } else { output = client.util.clean(evaled) }

          if (promise?.resolved) {
            color = "07fc03";
            type = "Promise (Resolved)";
          } else if (promise?.rejected) {
            color = "fc0303";
            type = "Promise (Rejected)";
          } else {
            color = "9c9c9c";
            type = (typeof raw).charAt(0).toUpperCase() + (typeof raw).slice(1);
          }

          const elapsed = Math.abs(Date.now() - i.createdTimestamp);
          const embed = new EmbedBuilder()
            .setColor(color)
            .addFields({ name: "\\📥 Input", value: `\`\`\`js\n${client.util.truncate(client.util.clean(query), 1000)}\`\`\`` })
            .setFooter({ text: `Type: ${type}\u2000•\u2000Evaluated in ${elapsed}ms.` });

          if (output.length > 1000) {
            await fetch("https://hastebin.com/documents", {
              method: "POST",
              body: output,
              headers: { "Content-Type": "text/plain" }
            })
              .then(res => res.json())
              .then(json => (bin = "https://hastebin.com/" + json.key + ".js"))
              .catch(() => null);
          }

          return i.editReply({
            embeds: [embed.addFields(
              [{
                name: "\\📤 Output",
                value: output.length > 1000 ? `\`\`\`fix\nExceeded 1000 characters\nCharacter Length: ${output.length}\`\`\`` : `\`\`\`js\n${output}\n\`\`\``
              },
              {
                name: "\u200b",
                value: `[\`📄 View\`](${bin}) • [\`📩 Download\`](${download})`
              }].splice(0, Number(output.length > 1000) + 1)
            )]
          });
        } catch (err) {
          const stacktrace = client.util.joinArrayAndLimit(err.stack.split("\n"), 900, "\n");
          const value = [
            '```xl',
            stacktrace.text,
            stacktrace.excess ? `\nand ${stacktrace.excess} lines more.` : '',
            '```'
          ].join('\n');

          return i.editReply({
            embeds: [new EmbedBuilder()
              .setColor("fc0303")
              .setFooter({ text: `${err.name}\u2000•\u2000Evaluated in ${Math.abs(Date.now() - i.createdTimestamp)}ms.` })
              .addFields([
                { name: "\\📥 Input", value: `\`\`\`js\n${client.util.truncate(client.util.clean(i.options.getString("query")), 1000, "\n...")}\`\`\`` },
                { name: "\\📤 Output", value }
              ])
            ]
          });
        }
      case "terms":
        const termsEmbed = new EmbedBuilder()
          .setTitle("Neko - Terms of Service")
          .setColor("ffc0cb")
          .setThumbnail("https://i.imgur.com/jdAeUUd.png")
          .setFooter({ text: "Last edited 15/8/2022", iconURL: i.member.user.displayAvatarURL() })
          .setTimestamp()
          .setDescription("Neko has access to the End User Data through the **Discord API**, but Neko **does not collect, use and/or disclose** End User Data **except (a)** as necessary to exercise your rights under this Agreement, **(b)** in accordance with Discord’s Privacy Policy.\n\n" +
            "We will **never** sell, license or otherwise commercialize any End User Data. Neither will we ever use End User Data to target End Users for marketing or advertising purposes. We will **never** even disclose any End User Data to any ad network, data broker or other advertising or monetization related service.\n\n" +
            "End User Data will be retained **only** as necessary to provide the defined functionality of the Application and nothing more.\n\n" +
            "We ensure that all End User Data is stored using reasonable security measures and we take reasonable steps to secure End User Data.\n\n" +
            "By using Neko, you **expressly agree** to this Agreement. And by using Discord, you **expressly agree** to Discord’s Terms of Service, Guidelines and Privacy Policy.\n\n" +
            "To read our **full** Terms of Service, refer [here](https://github.com/NekoOfficial/Terms-and-Policy/blob/main/Terms%20of%20Service.md). For our **full** Privacy Policy, refer [here](https://github.com/NekoOfficial/Terms-and-Policy/blob/main/Privacy%20Policy.md).\n\n" +
            "*“End User Data” means all data associated with the content within the functionality enabled by the Discord API, including but not limited to message content, message metadata, voice data and voice metadata.*")
        i.editReply({ embeds: [termsEmbed] })
        break;
      case "vote":
        // Pretty simple one
        const voteTitle = ["Feeling good?", "You decided to show up?", "W-Wanna give me some love?", "O-Oh, hello!"];
        const voteResponse = voteTitle[Math.round(Math.random() * voteTitle.length)] + ` [Click here to vote for me!](<https://top.gg/bot/https://top.gg/bot/704992714109878312>)` + "\n\n||**Tip:** By voting, you'll have some extra perks to features that'll roll out in the near future!||"
        i.editReply({ content: voteResponse })
        break;
      case "feedback":
        // Check if query and attachment are supplied
        const attachment = i.options.getAttachment("attachment");
        if (!query && !attachment) {
          return i.editReply({ content: `Baka, I can't send empty stuff. Give me something, at least!` })
        };
        // Premade embed
        const type = i.options.getString("type")
        const channel = client.channels.cache.get(client.config.log);
        const feedbackEmbed = new EmbedBuilder()
          .setTitle(`New ${type}!`)
          .setThumbnail(type == "Issue" ? "https://i.imgur.com/1xMJ0Ew.png" : "https://i.imgur.com/XWeIyTD.png")
          .setFooter({ text: "Helpful things for you, sensei!", iconURL: i.member.user.displayAvatarURL() })
          .setColor(type == "Issue" ? "Red" : "ffc0cb")
          .setTimestamp()
          .setDescription(`*Sent by **${i.member.user.properTag()}** from **${i.guild.name}***\n\n**Description:** ${query ? query : "None"}\n**Image:** ${attachment ? "" : "None"}`)
        if (query && !attachment) {
          // Check if the feedback is too short or too long
          if (query.length > 1000 || query.length < 50) {
            return i.editReply({ content: `H-Hey, that's wayyy too ${query.length > 1000 ? "long" : "short"}. I'll give you another chance!` })
          };
          await fetch(process.env["GIBBERISH_API"], {
            headers: { "Authorization": `Bearer ${process.env["AI_API"]}` },
            method: 'post',
            body: JSON.stringify(query),
          }).then(res => res.json()).then(json => {
            // In case the API didn't wake up in time
            // This is gonna be tiring to the user who actually does it but for my well-being, I have to
            if (!json[0][0]) {
              return i.editReply({ content: "O... Oh, the input checker hasn't woke up yet. Perhaps wait for a bit?\n\n||Ideally **30** seconds!||" })
            }
            // Not 100% accurate, I can be spammed, but at least it'll do for now.
            else if (json[0][0].label == "noise" || json[0][0].label == "mild gibberish") {
              const invalidImage = new AttachmentBuilder("https://i.imgur.com/ckFBapA.png", { name: "invalid.png" })
              const correctImage = new AttachmentBuilder("https://i.imgur.com/MAJDlEX.png", { name: "correct.png" })
              return i.editReply({ content: "That's gibberish, you baka. Fix it to be absolutely clean!" }).then(msg => {
                setTimeout(() => {
                  msg.edit({ content: "**General tip:** Don't send stuff like these! They can't be parsed normally!", files: [invalidImage] }).then(msg => {
                    setTimeout(() => {
                      msg.channel.send({ content: "This is how a good feedback looks like!", files: [correctImage] })
                    }, 1000)
                  })
                }, 3000)
              })
            } else {
              i.editReply({ content: "I've sent that for you! Sensei'll reach out as soon as possible!" })
              return channel.send({ embeds: [feedbackEmbed] })
                .catch(() => { });
            }
          })
        } else if (attachment) {
          if (attachment.contentType !== "image/png") return i.editReply({ content: "S-Sorry, but we only accept **PNG images**!" })
          i.editReply({ content: "I've sent that for you! Sensei'll reach out as soon as possible!" })
          feedbackEmbed.setImage(attachment.url)
          return channel.send({ embeds: [feedbackEmbed] })
            .catch(() => { });
        }
        break;
    }
  }
}
