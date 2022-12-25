const Command = require(`${process.cwd()}/src/struct/cmd/Command`);
const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const fetch = require("node-fetch")

module.exports = class Fun extends Command {
  constructor(client) {
    super(client, {
      data: new SlashCommandBuilder()
        .setName("fun")
        .setDescription("Long list of subcommands for... fun.")
        .addSubcommand(cmd => cmd
          .setName("8ball")
          .setDescription("Ask me anything.")
          .addStringOption(option => option.setName("query").setDescription("just.. ask me.").setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName("hololive")
          .setDescription("Spams you with hololive images.")
          .addStringOption(option => option
            .setName("query")
            .setDescription("the thing that you want to be spammed with.")
            .setRequired(true)
            .addChoices(...[
              { name: 'suisei', value: 'suisei' }
            ])
          )
        )
        .addSubcommand(cmd => cmd
          .setName('fact')
          .setDescription("Gives you a random fact. Mostly useless though.")
        )
        .addSubcommand(cmd => cmd
          .setName('today')
          .setDescription("Gives you a random fact of today, in the past.")
        )
        .addSubcommand(cmd => cmd
          .setName('meme')
          .setDescription("Gives you a random meme, with 10% chance cancelling you.")
          .addStringOption(option => option.setName("query").setDescription("the subreddit name. If you just want to see average memes, skip."))
        )
        .addSubcommand(cmd => cmd
          .setName('ship')
          .setDescription("Ships 2 people you mention, with 5% faith in the lucky wheel.")
          .addUserOption(option => option.setName("first").setDescription("...literally the first person.").setRequired(true))
          .addUserOption(option => option.setName("second").setDescription("...literally the second person, duh!").setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName('fortune')
          .setDescription("Gives you a random fortune cookie's paper.")
        )
        .addSubcommand(cmd => cmd
          .setName('truth')
          .setDescription("Gives you a random truth question, from the ol' truth or dare game.")
        ),
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
        await fetch(`https://meme.eiri.ga/gimme/${query ? query : "random"}`,
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
    }
  }
}
