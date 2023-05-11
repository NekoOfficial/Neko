const Command = require(`${process.cwd()}/src/struct/cmd/Command`);
const { EmbedBuilder, AttachmentBuilder } = require("discord.js")
const fetch = require("node-fetch")
const { funImports } = require("../util/imports");

module.exports = class Fun extends Command {
  constructor(client) {
    super(client, {
      data: funImports,
      usage: "fun <command>",
      category: "fun",
      cooldown: 5000
    });
  }
  async run(client, i) {
    // Get the subcommand
    const sub = i.options.getSubcommand();
    // Get the query
    const query = i.options.getString("query");
    // Defer the reply
    await i.deferReply();
    // Use switch-case-break
    switch (sub) {
      case "8ball":
        const eightball = [
          'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes, definitely.',
          'Rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Yes.',
          'Sign point to yes.', 'Reply hazy, try again.', 'Ask again later.', 'Will not tell you now.',
          'Cannot predict now.', 'Ask again.', 'Don\'t count on it.', 'I\'ll say no.',
          'My sources say no.', 'Outlook not so good.', 'Very doubtful.', "Yes", "No", "Yeah", "Nope", 
          "Flip a coin on it, I dunno.", "I mean, if that's what *you* think...", 
          "Sure", "Not really.", "You know, I talked to the bard, and he doesn't think so.", 
          "The dragonborn says yes.", "Well, it doesn't really matter. We're in the middle of a fight here, you know.",
          "I'd say yeah.", "Roll some dice on it. After all, the dice are never wrong.", "The dice said... uh... it's best we don't talk about it.",
          "The dice say so, so yes.", "Absofrickinlutely not.", "For sure", "Definitely.", "We flipped a dead skeleton's bone, it said no.",
          "Go wake up that hellhound over there. If you live, it's a yes, if you die, it's a no."
        ];
        if (client.util.isProfane(query)) return i.editReply({ content: "Baka, I won't answer that one. Fix your wordings." });
        i.editReply({ content: eightball[Math.floor(Math.random() * eightball.length)] });
        break;
      case "hololive":
        await i.editReply({
          content: "Here you go.", embeds: [new EmbedBuilder()
            .setColor("#fcff57")
            .setImage(client.images[query]())]
        });
        break;
      case "fact":
        // Literally the easiest subcommand to make
        await fetch("https://uselessfacts.jsph.pl/random.json?language=en").then(res => res.json()).then(json => {
          i.editReply({ content: json.text });
        });
        break;
      case "today":
        const baseDate = new Date;
        const date = baseDate.toLocaleDateString();
        const trimmedDate = date.trim().split("/");
        const [month, day, reqYear] = trimmedDate;

        await fetch(`https://history.muffinlabs.com/date/${month}/${day}`).then(res => res.json()).then(json => {
          const ranInt = Math.floor(Math.random() * json.data.Events.length + 1)
          const { text, year } = json.data.Events[ranInt]
          i.editReply({ content: `On **${json.date}, ${year}**: ${text}` });
        });
        break;
      case "meme":
        // Cancelling is a legit thing.
        // We wanna create some fun and frustrations, this is the fun category after all!
        const cancelRate = client.util.probability(10) // Simulating 10%: 1/10
        const cancelResponse = [
          "Just coming here to say you've been cancelled.", "Yo, onee-chan. You're cancelled.",
          "You've been ignored.", "He he he haw.", "Baka, you're unlucky. Get cancelled."
        ]
        const cancelled = cancelResponse[Math.floor(Math.random() * cancelResponse.length)] + "\n\n||Execute the command again.||"
        if (cancelRate) return i.editReply({ content: cancelled })
        await fetch(`https://memeapi.tonycrafter.repl.co/gimme/${query ? query : "random"}`,
          { headers: { "content-type": 'application/json' } }).then(res => res.json()).then(json => {
            if (json.err) return i.editReply({ content: "U-Uh, just coming here to say that this subreddit has no posts or doesn't exist." });
            // Pseudo-cancel. This can be avoided by getting into a NSFW channel.
            if (json.nsfw === true && !i.channel.nsfw) return i.editReply({ content: cancelled })

            const meme = new EmbedBuilder()
              .setTitle(`**${json.title}**`)
              .setURL(json.meme.url)
              .setDescription(`*Posted in **r/${query ? query : json.randomKey}** by **${json.author}***`)
              .setImage(json.meme.image)
              .setColor("#fcff57")
              .setTimestamp()
              .setFooter({ text: `${json.upVotes} likes`, iconURL: i.member.user.displayAvatarURL({ dynamic: true }) });
            i.editReply({ embeds: [meme] })
          })
        break;
      case "ship":
        const first = i.options.getUser("first");
        const second = i.options.getUser("second");
        if (first == client.user || second == client.user) return i.editReply({ content: "Ew, I'm not a fan of shipping. Choose someone else!" })
        // I mean... it's fun, right?
        const luckyWheelRate = client.util.probability(5);
        // Roll between 0 and 100. 100 will be a bit lower, imagine a wheel but with the 0% field bigger.
        const rollProbability = client.util.probability(40)
        let result, luckyWheelArr = ["0", "100"];
        if (rollProbability) result = luckyWheelArr[1]; else result = luckyWheelArr[0];
        // If they don't get the lucky wheel roll, proceed with the rolling as normal:
        const normalRate = Math.floor(Math.random() * 100)
        // Then check if we have a lucky wheel instance.
        if (luckyWheelRate) return i.editReply({ content: "Lucky wheel time! Let's see if you two are lucky!" }).then(msg => {
          setTimeout(() => {
            msg.edit({ content: `${result == 100 ? "Hey, good couple! You rolled **100%**!" : "Baka, you two lost. **0%** rate!"}` })
          }, 3000)
        }); else i.editReply({ content: normalRate > 50 ? `Ooh, fairly good! You two have a ship rate of **${normalRate}%**!` : `My sources say no to you two. **${normalRate}%** is a fairly disgusting rate.` })
        break;
      case "fortune":
        const cookies = require("../assets/json/fortune.json")
        const fortune = cookies[Math.floor(Math.random() * cookies.length)]

        i.editReply({ content: fortune })
        break;
      case "truth":
        const question = require("../assets/json/truth.json")
        const truth = question[Math.floor(Math.random() * question.length)]

        i.editReply({ content: truth })
        break;
      case "pooh":
        const normal = i.options.getString("normal");
        const pro = i.options.getString("pro");

        const poohres = await fetch(`https://api.popcatdev.repl.co/pooh?text1=${normal}&text2=${pro}`);
        const poohmeme = new AttachmentBuilder(await poohres.buffer(), { name: "pooh.jpg" });
        const poohembed = new EmbedBuilder()
          .setDescription(`Yup, that's the definite way.`)
          .setImage("attachment://pooh.jpg").setTimestamp().setColor("#fcff57")
          .setFooter({ text: "Powered by PopCat API", iconURL: i.member.user.displayAvatarURL() });
        // Send it
        i.editReply({ embeds: [poohembed], files: [poohmeme] });
        break;
      case "drake":
        const no = i.options.getString("no");
        const yes = i.options.getString("yes");

        const drakeres = await fetch(`https://frenchnoodles.xyz/api/endpoints/drake?text1=${no}&text2=${yes}`);
        const drakememe = new AttachmentBuilder(await drakeres.buffer(), { name: "drake.jpg" });
        const drakeembed = new EmbedBuilder()
          .setDescription(`Ah, finally. Brilliant.`)
          .setImage("attachment://drake.jpg").setTimestamp().setColor("#fcff57")
          .setFooter({ text: "Powered by PopCat API", iconURL: i.member.user.displayAvatarURL() });
        // Send it
        i.editReply({ embeds: [drakeembed], files: [drakememe] });
        break;
      case "aliens":
        const top = i.options.getString("top");
        const bottom = i.options.getString("bottom");

        const alienres = await fetch(`https://apimeme.com/meme?meme=Ancient-Aliens&top=${encodeURIComponent(top)}&bottom=${encodeURIComponent(bottom)}`);
        const alienmeme = new AttachmentBuilder(await alienres.buffer(), { name: "aliens.jpg" });
        const alienembed = new EmbedBuilder()
          .setDescription(`Yeah.`)
          .setImage("attachment://aliens.jpg").setTimestamp().setColor("#fcff57")
          .setFooter({ text: "Powered by MemeAPI", iconURL: i.member.user.displayAvatarURL() });
        // Send it
        i.editReply({ embeds: [alienembed], files: [alienmeme] });
        break;
    }
  }
}
  