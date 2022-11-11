// Big one.
// After all this is what Neko's born to do
// Base stuff first
const Command = require(`${process.cwd()}/src/struct/cmd/Command`);
const { EmbedBuilder, SlashCommandBuilder, GuildEmoji } = require("discord.js");
// Util goes after
require("moment-duration-format");
const { decode } = require("he");
const { SauceNao } = require("saucenao.js");
const sauce = new SauceNao({ api_key: process.env["SAUCENAO"] });
const moment = require("moment");
const _ = require("lodash");
const fetch = require("node-fetch");
const animeDB = require("../assets/json/anime.json");
const waifuDB = require('../assets/json/waifulist.json');
const { convert: toMarkdown } = require("html-to-markdown");
const Paginate = require("../struct/util/Pagination");
const Discovery = require("../struct/anime/Discovery");

module.exports = class Eval extends Command {
  constructor(client) {
    super(client, {
      data: new SlashCommandBuilder()
        .setName("anime")
        .setDescription("Bawa, you baka.")
        .addSubcommand(cmd => cmd
          .setName("action")
          .setDescription("Spams you with images where anime characters do stuff.")
          .addStringOption(option => option
            .setName("query")
            .setDescription("the thing that you want to be spammed with.")
            .setRequired(true)
            .addChoices(...[
              // I tried anyway.
              { name: 'bully', value: 'bully' }, { name: 'cry', value: 'cry' },
              { name: 'awoo', value: 'awoo' }, { name: 'bonk', value: 'bonk' },
              { name: 'yeet', value: 'yeet' }, { name: 'hug', value: 'hug' },
              { name: 'lick', value: 'lick' }, { name: 'neko', value: 'neko' },
              { name: 'pat', value: 'pat' }, { name: 'blush', value: 'blush' },
              { name: 'slap', value: 'Slap' }, { name: 'wave', value: 'wave' },
              { name: 'smile', value: 'smile' }, { name: 'smug', value: 'smug' },
              { name: 'highfive', value: 'highfive' }, { name: 'wink', value: 'wink' },
              { name: 'handhold', value: 'handhold' }, { name: "nom", value: "nom" },
              { name: 'bite', value: 'bite' }, { name: "glomp", value: "glomp" },
              { name: "kick", value: "kick" }, { name: 'happy', value: 'happy' },
              { name: "poke", value: "poke" }, { name: 'dance', value: 'dance' },
              { name: "cringe", value: "cringe" }
            ])
          )
        )
        .addSubcommand(cmd => cmd
          .setName("alprofile")
          .setDescription("find user profile on AniList.")
          .addStringOption(option => option.setName("query").setDescription("...the username, of course.").setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName("search")
          .setDescription("search for anime series on kitsu.io")
          .addStringOption(option => option.setName('query').setDescription('...the anime name, of course.').setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName("meme")
          .setDescription("peaceful command, it won't cancel you like what /fun meme do.")
        )
        .addSubcommand(cmd => cmd
          .setName("quote")
          .setDescription("anime quotes, best stuff ever.")
        )
        .addSubcommand(cmd => cmd
          .setName("random")
          .setDescription("random anime recommendations")
        )
        .addSubcommand(cmd => cmd
          .setName("character")
          .setDescription("search for a character on MyAnimeList")
          .addStringOption(option => option.setName('query').setDescription('...the character name, of course.').setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName("discover")
          .setDescription("randomly generated anime/manga lists for you")
          .addStringOption(option => option
            .setName("query")
            .setDescription("...the type, surely.")
            .addChoices(...[
              { name: "anime", value: "anime" },
              { name: "manga", value: "manga" }
            ])
            .setRequired(true)
          )
        )
        .addSubcommand(cmd => cmd
          .setName("hentai")
          .setDescription("...well, obvious. In NSFW only!")
          .addStringOption(option => option.setName('query').setDescription('...the image category. For safety reasons, options won\'t be shown.').setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName("sauce")
          .setDescription("oOoOh. In NSFW only!")
          .addAttachmentOption(option => option.setName('image').setDescription('...the image you want to get the sauce, of course.').setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName("malprofile")
          .setDescription("find user profile on MyAnimeList")
          .addStringOption(option => option.setName('query').setDescription('...the profile name, of course.').setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName("manga")
          .setDescription("search for a manga on kitsu.io")
          .addStringOption(option => option.setName('query').setDescription('...the manga name, of course.').setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName("schedule")
          .setDescription("show the list of currently airing anime today, or a given weekday")
          .addStringOption(option => option
            .setName("query")
            .setDescription("...literally the day.")
            .addChoices(...[
              { name: "Monday", value: "monday" },
              { name: "Tuesday", value: "tuesday" },
              { name: "Wednesday", value: "wednesday" },
              { name: "Thursday", value: "thursday" },
              { name: "Friday", value: "friday" },
              { name: "Saturday", value: "saturday" },
              { name: "Sunday", value: "sunday" }
            ])
            .setRequired(true)
          )
        )
        .addSubcommand(cmd => cmd
          .setName("seiyuu")
          .setDescription("search for seiyuu's on your favorite anime characters")
          .addStringOption(option => option.setName('query').setDescription('...the seiyuu\'s name, of course.').setRequired(true))
        )
        .addSubcommand(cmd => cmd
          .setName("waifu")
          .setDescription("expermental.")
        )
        .addSubcommand(cmd => cmd
          .setName("watch")
          .setDescription("add a new anime to watch for new episodes.")
          .addStringOption(option => option
            .setName("query")
            .setDescription("...literally the URL. You may use AniList or MyAnimeList.")
            .setRequired(true)
          )
          .addChannelOption(option => option
            .setName("channel")
            .setDescription("The channel you'd like to receive the announcement.")
          )
        )
        .addSubcommand(cmd => cmd
          .setName("unwatch")
          .setDescription("remove an anime from this server's watchlist.")
          .addStringOption(option => option
            .setName("query")
            .setDescription("...literally the URL. You may use AniList or MyAnimeList.")
            .setRequired(true)
          )
        )
        .addSubcommand(cmd => cmd
          .setName("watching")
          .setDescription("view list of anime(s) this server subscribed to.")
        ),
      cooldown: 10000,
      usage: "anime <command>",
      query: "anime",
      permissions: ["Use Application Commands", "Send Messages", "Embed Links"]
    });
  }
  async run(client, i) {
    // require-text alternative
    const watching = client.util.textRequire("../assets/graphql/Watching.graphql", require);
    const userquery = client.util.textRequire("../assets/graphql/User.graphql", require);
    // Defer our reply for some commands
    await i.deferReply();
    // Get the query
    const query = i.options.getString("query");
    // Now get our subcommand
    const sub = i.options.getSubcommand();
    // rewrite
    if (sub == "watching") {
      if (!client.db) return i.editReply({ content: "The database is not connected at the moment, maybe try again later?\n\n||Issue didn't resolve for more than an hour? Use `/bot feedback` to notice my sensei!||" });
      if (!i.guild.settings.anisched_data.length) return i.editReply({ content: "Baka, this server has no anime subsriptions." });
      const entries = [];
      const watched = i.guild.settings.anisched_data;
      let page = 0
      let hasNextPage = false;
      do {
        const res = await client.ani.fetch(watching, { watched, page });
        if (res.errors) {
          return i.editReply({ content: "O-Oh, AniList returned an error. Maybe try again later?\n\n||Issue didn't resolve for more than an hour? Use `/bot feedback` to notice my sensei!||" });
        } else if (!entries.length && !res.data.Page.media.length) {
          return i.editReply({ content: "Baka, this server has no anime subsriptions." });
        } else {
          page = res.data.Page.pageInfo.currentPage + 1;
          hasNextPage = res.data.Page.pageInfo.hasNextPage;
          entries.push(...res.data.Page.media.filter(x => x.status === 'RELEASING'));
        };
      } while (hasNextPage);

      const chunks = entries.sort((A, B) => A.id - B.id).map(entry => {
        const id = ' '.repeat(6 - String(entry.id).length) + String(entry.id);
        const title = client.util.truncate(entry.title.romaji, 42, '...');
        return `• \`ID: [${id}]\` [**${title}**](${entry.siteUrl})`;
      });
      const descriptions = _.chunk(chunks, 20).map(d => d.join('\n'));

      const pages = new Paginate(descriptions.map((d, n) => {
        return new EmbedBuilder()
          .setColor('#fcff57')
          .setDescription(`${d}`)
          .setThumbnail("https://i.imgur.com/wJqBxdk.png")
          .setAuthor({ name: `Current AniSchedule subscription` })
          .setFooter({ text: `${[
            `AniSchedule Watchlist`,
            `Page ${n + 1} of ${descriptions.length}`
          ].join(' • ')}`, iconURL: i.member.user.displayAvatarURL() })
          .addFields({ name: 'Tips', value: `${[
            `- Use \`/anime watch\` to add subscription`,
            `- Use \`/anime unwatch\` to remove subscription`
          ].join('\n')}` })
      }));

      const msg = await i.editReply({ embeds: [pages.firstPage] });

      if (pages.size == 1) return;

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
          case prev instanceof GuildEmoji ? prev.name : prev:
            msg.edit({ embeds: [pages.previous()] });
            break;
          case next instanceof GuildEmoji ? next.name : next:
            msg.edit({ embeds: [pages.next()] });
            break;
          case terminate instanceof GuildEmoji ? terminate.name : terminate:
            collector.stop();
            break;
        };
        await reaction.users.remove(i.member.user.id);
        timeout.refresh();
      });
      collector.on('end', async () => await msg.reactions.removeAll());
    } else if (sub == "action") {
      await fetch(`https://api.waifu.pics/sfw/${query}`).then(res => res.json()).then(json => {
        i.editReply({
          content: "Here you go.", embeds: [new EmbedBuilder()
            .setColor("#fcff57")
            .setImage(json.url)]
        });
      })
    }
    else if (sub == "alprofile") {
      // Check query immediately
      if (client.util.isProfane(query)) return i.editReply({ content: "Nah, I won't search for that one. Fix your wordings." });
      // Fetch the userquery
      const res = await client.ani.fetch(userquery, { search: query });
      // If there is no res
      if (res.errors) {
        let err;
        if (res.errors[0].status == 404) err = "H-Hey, that one doesn't exist. Perhaps check your query?";
        else if (res.errors.some(a => a.status >= 500)) err = "O-Oh, AniList is having some sort of trouble. Try again later, maybe?";
        else if (res.errors.some(a => a.status >= 400)) err = "Sensei messed up :sob: use `/bot feedback` to report this!\n\n||**Debug info:** I tried to send an invalid request!||";
        else err = "S-Something wrong has occured! Perhaps try again later?";
        return i.editReply({ content: err });
      }
      // Temp. solution
      const topFields = Object.entries(res.data.User.favourites).map(([query, target]) => {
        const firstTarget = target.edges.map(entry => {
          const identifier = entry.node.title || entry.node.name;
          const name = typeof identifier === 'object' ? identifier.userPreferred || identifier.full : identifier;
          return `[**${name}**](${entry.node.siteUrl})`;
        }).join('|') || 'None Listed';
        return `\n**Top 1 ${query}:** ` + firstTarget.split("|")[0];
      });
      const alprofile = new EmbedBuilder()
        .setColor("#fcff57")
        .setImage(res.data.User.bannerImage)
        .setThumbnail(res.data.User.avatar.medium)
        .setTitle(res.data.User.name)
        .setURL(res.data.User.siteUrl)
        .setDescription(`***About the user:** ${res.data.User.about ? client.util.truncate(decode(res.data.User.about.replace(/(<([^>]+)>)/g, '') || ''), 250) : "No description provided"}*` + `\n${topFields}`)
        .setFooter({ text: "Data sent from AniList", iconURL: i.member.user.displayAvatarURL() })
        .setTimestamp();
      i.editReply({ embeds: [alprofile] });
    }
    else if (sub == "search") {
      // Check the query immediately before requesting.
      if (client.util.isProfane(query)) return i.editReply({ content: "Nah, I won't search for that one. Fix your wordings." });
      await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}`).then(res => res.json()).then(json => {
        // Didn't want to use a short name like this but I just want to simplyfy.
        const r = json.data[0].attributes;
        // If we can't find it, reply.
        if (!r) return i.editReply({ content: "O-Oh, I don't remember seeing this. They told me they haven't, either.\n\n||Maybe fix your query?||" });
        // If result is NSFW and channel is not, reply.
        if (r.nsfw && i.channel.nsfw) return i.editReply({ content: "Uh, that's NSFW and you're not in a NSFW channel. I'm not allowed to send that here!" });
        // If result has "Nudity" or "Mature" (according to Kitsu.io) in its age rating guide and channel is not NSFW, reply.
        if (r.ageRatingGuide.includes("Nudity") || r.ageRatingGuide.includes("Mature") && !i.channel.nsfw) return i.editReply({ content: "Uh, that has something to do with NSFW and you're not in a NSFW channel. I'm not allowed to send that here!" });
        // Now make our embed
        const embed = new EmbedBuilder()
          .setTitle(r.titles.en) // Use English title
          .setURL(`https://kitsu.io/${json.data[0].id}`) // Set the URL for title
          .setThumbnail(r.posterImage.original)
          .setDescription(
            `*The cover of this anime can be found [here](https://media.kitsu.io/anime/poster_images/${json.data[0].id}/large.jpg)*\n\n` +
            `**Description:** ${client.util.textTruncate(`${r.synopsis}`, 250, `... *(read more [here](https://kitsu.io/anime/${json.data[0].id}))*`)}`
          ) // For mobile users
          .setColor("#fcff57") // light yellawh
          .addFields([
            { name: "Type", value: `${r.showType}`, inline: true },
            { name: "Status", value: client.util.toProperCase(`${r.status}`), inline: true },
            { name: "Air Date", value: `${r.startDate}`, inline: true },
            { name: "Ep. Count", value: `${r.episodeCount}`, inline: true },
            { name: "Avg. Rating", value: `${r.averageRating}`, inline: true },
            { name: "Age Rating", value: `${r.ageRatingGuide}`, inline: true },
            { name: "Rating Rank", value: `#${r.ratingRank.toLocaleString()}`, inline: true },
            { name: "Popularity", value: `#${r.popularityRank.toLocaleString()}`, inline: true },
            { name: "NSFW?", value: client.util.toProperCase(`${r.nsfw}`), inline: true }
          ]) // Data
          .setFooter({ text: 'Powered by kitsu.io', iconURL: i.member.user.displayAvatarURL() })
          .setTimestamp();
        // Then send it
        i.editReply({ embeds: [embed] });
      })
    }
    else if (sub == "meme") {
      await fetch(`https://meme-api.herokuapp.com/gimme/animemes`,
        { headers: { "content-type": 'application/json' } }).then(res => res.json()).then(json => {
          const meme = new EmbedBuilder()
            .setTitle(`**${json.title}**`)
            .setURL(json.postLink)
            .setDescription(`*Posted by **${json.author}***`)
            .setImage(json.url)
            .setColor("#fcff57")
            .setTimestamp()
            .setFooter({ text: `${json.ups} likes`, iconURL: i.member.user.displayAvatarURL({ dynamic: true }) });
          i.editReply({ embeds: [meme] })
        });
    }
    else if (sub == "quote") {
      await fetch(`https://animechan.vercel.app/api/random`).then(res => res.json()).then(json => {
        i.editReply({ content: `**${json.character}** from **${json.anime}**:\n\n${json.quote}` });
      });
    }
    else if (sub == "random") {
      const db = animeDB.filter(a => i.channel.nsfw === a.isAdult);
      const { ids: { al: id } } = db[Math.floor(Math.random() * db.length)];
      // Pretty long, eh?
      const { errors, data } = await client.ani.fetch(`query ($id: Int) { Media(id: $id){ siteUrl id idMal synonyms isAdult format startDate { year month day } episodes duration genres studios(isMain:true){ nodes{ name siteUrl } } coverImage{ large color } description title { romaji english native userPreferred } } }`, { id });
      if (errors) {
        let err;
        if (errors.some(x => x.status === 429)) err = "O... Oh, they didn't let me go through because I'm rate-limited. Try again in a minute?";
        if (errors.some(x => x.status === 400)) err = "A wild bug 🐛 appeared! Use `/bot feedback` to report this!\n\n||**Debug info:** I tried to send an invalid request!||";
        else err = "S-Something wrong has occured! Perhaps try again later?";
        return i.editReply({ content: err });
      };
      const anirandom = new EmbedBuilder()
        .setColor("#fcff57")
        .setAuthor({
          name: [
            client.util.truncate(data.Media.title.romaji || data.Media.title.english || data.Media.title.native),
            client.ani.info.mediaFormat[data.Media.format]
          ].join('\u2000|\u2000'), url: data.Media.siteUrl
        })
        .setThumbnail(data.Media.coverImage.large)
        .setTimestamp()
        .setFooter({ text: `Data sent from MyAnimeList`, iconURL: i.member.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`${data.Media.studios.nodes?.map(x => `[${x.name}](${x.url})`).join('\u2000|\u2000') || 'None'}`)
        .addFields([
          {
            name: 'Other Titles',
            value: [
              `•\u2000**Native**:\u2000${data.Media.title.native || 'None'}`,
              `•\u2000**Romanized**:\u2000${data.Media.title.romaji || 'None'}`,
              `•\u2000**English**:\u2000${data.Media.title.english || 'None'}`
            ].join('\n')
          }, {
            name: 'Genres',
            value: client.util.joinArray(data.Media.genres) || '\u200b'
          }, {
            name: 'Started',
            value: [
              client.ani.info.months[data.Media.startDate.month || 0],
              data.Media.startDate.day || '',
              data.Media.startDate.year || ''
            ].filter(Boolean).join(' ') || 'Unknown',
            inline: true
          }, {
            name: 'Episodes',
            value: `${data.Media.episodes}` || 'Unknown',
            inline: true
          }, {
            name: 'Duration (in minutes)',
            value: `${data.Media.duration}` || 'Unknown',
            inline: true
          }, {
            name: 'Description',
            value: client.util.truncate(toMarkdown(decode((data.Media.description || '').replace(/<br>/g, ''))), 1000, `... *[read more here](https://myanimelist.net/anime/${data.Media.idMal})*`) || '\u200b'
          }
        ])
      i.editReply({ embeds: [anirandom] })
    }
    else if (sub == "character") {
      // Check the query immediately before requesting.
      if (client.util.isProfane(query)) return i.editReply({ content: "Nah, I won't search for that one. Fix your wordings." });
      let charData = await fetch(`https://api.jikan.moe/v3/search/character?q=${encodeURI(query)}&page=1`).then(res => res.json());
      // Actually I suck at predefining
      const errData = {
        "404": "H.. Hey, that character doesn't exist, I don't remember seeing them too! Maybe check your query?",
        "429": "O-Ow, they set a cooldown on me. Perhaps try again later?",
        "500": "MyAnimeList is probably down at the moment... I-In the meantime why don't fiddle with other commands?",
        "503": "MyAnimeList is probably down at the moment... I-In the meantime why don't fiddle with other commands?"
      }
      if (!charData || charData.error) {
        // Get the status error code if the API throws an error
        i.editReply({ content: errData[charData.status] });
      };
      // Get the results from the data we've just fetch
      const { results: [{ mal_id }] } = charData;
      // Now fetch the character's information:
      const charRes = await fetch(`https://api.jikan.moe/v3/character/${mal_id}`).then(res => res.json());
      // Do the same with the real character data
      if (!charRes || charRes.error) {
        // Get the status error code if the API throws an error
        i.editReply({ content: errData[charRes.status] });
      };
      // Now get the anime and manga's data
      const [anime, manga] = ["animeography", "mangaography"].map(x => {
        const ographyData = charRes[x]?.map(y => {
          const url = y.url.split("/").slice(0, 5).join("/");
          // Not sure what do we have to do here...
          // Basically we're returning a hyperlink [text](url)
          return "[" + y.name + "](" + url + ") (" + y.role + ")";
        })
        return client.util.joinArrayAndLimit(ographyData, 1000, " • ");
      })
      const mediaStore = { anime, manga };
      const charEmbed = new EmbedBuilder()
        .setAuthor({ name: `${charRes.name} ${charRes.name_kanji ? `| ${charRes.name_kanji}` : ``}` })
        .setURL(charRes.url)
        .setFooter({ text: `Data sent from MyAnimeList`, iconURL: i.member.user.displayAvatarURL() })
        .setTimestamp()
        .setThumbnail(charRes.image_url)
        .setColor("#fcff57")
        .setDescription(`***About this character:**\n ${charRes.about ? `${client.util.textTruncate(charRes.about.replace(/\\n/g, ""), 500, `... read more [here](${charRes.url})`)}` : "No description provided."}*`)
        .addFields([
          ...['Anime', 'Manga'].map(media => {
            const store = mediaStore[media.toLowerCase()];
            return {
              name: `${media} Appearance (${charRes[media.toLowerCase() + 'ography']?.length || 0})`,
              value: `${store?.text || 'None'} ${store.excess ? `\n... and ${store.excess} more!` : ''}`
            };
          }),
          ..._.chunk(charRes.voice_actors, 3).slice(0, 3).map((va_arr, discoveryIndex) => {
            return {
              inline: true,
              name: discoveryIndex === 0 ? `Seiyuu (${charRes.voice_actors.length})` : '\u200b',
              value: va_arr.map((va, i) => {
                const flag = client.ani.info.langflags.find(m => m.lang === va.language)?.flag;
                if (discoveryIndex === 2 && i === 2) {
                  return `... and ${charRes.voice_actors.length - 8} more!`;
                } else {
                  return `${flag || va.language} [${va.name}](${va.url})`;
                };
              }).join('\n') || '\u200b'
            };
          })
        ]);
      i.editReply({ embeds: [charEmbed] })
    }
    else if (sub == "discover") {
      // If the collection doesn't contain our discovery list for that user, create one:
      if (!client.collections.exists('discovery', i.member.user.id)) {
        client.collections.setTo('discovery', i.member.user.id, new Discovery(client, i.member));
      };
      // Now get the collection
      const profile = client.collections.getFrom('discovery', i.member.user.id);
      let discover;
      // If the data doesn't exist, generate one
      if (!profile.hasData) {
        discover = await profile.generateList().fetch();
      };
      // If the data expired, clear the old list and generate a new one
      if (profile.isExpired) {
        discover = await profile.clearList().generateList().fetch();
      };
      // If the query returns error
      if (discover && discover.errors.length) i.editReply({ content: "O... Oh, oops, this isn't supposed to happen. Try again in a few minutes.\n\n||The issue hasn't resolved after hours? Use `/bot feedback` to report this!||" });
      // Now proceed as normally
      let discoveryIndex = 0;
      const discoveryData = profile.get(query);
      const discoveryPages = new Paginate(new EmbedBuilder()
        .setColor("#fcff57")
        .setTitle(`Get Random ${client.util.toProperCase(query)} Recommendations with your Discovery Queue!`)
        .setThumbnail("https://i.imgur.com/wJqBxdk.png")
        .setDescription(`*Your Discovery Queue is unique and randomly generated. 5 random genres are selected and random ${query}s are picked out of those genres for you. You get a different ${query} recommendations daily, so don't miss the chance to discover every day!*`)
        .setFooter({ text: `${client.util.toProperCase(query)} Discovery, brought to you by AniList`, iconURL: i.member.user.displayAvatarURL() })
        .setTimestamp()
        .addFields([
          {
            name: 'Your Genres:',
            value: `${profile[query].genres.map(g => `${g}`).join('\n')}`
          },
          {
            name: '\u200b',
            value: 'Start your queue by clicking  :arrow_forward:  below!'
          }
        ])
      );

      for (const info of discoveryData) {
        discoveryPages.add(new EmbedBuilder()
          .setColor("#fcff57")
          .setAuthor({
            name: [
              profile[query].genres[discoveryIndex],
              client.util.truncate(info.title.romaji || info.title.english || info.title.native),
              client.ani.info.mediaFormat[info.format]
            ].join('\u2000|\u2000')
          })
          .setDescription(`${info.studios.nodes?.slice(0, 1).map(x => `[${x.name}](${x.siteUrl})`).join('') || "No studios provided"}`)
          .setThumbnail(info.coverImage.large)
          .setFooter({ text: `${client.util.toProperCase(query)} Discovery, brought to you by AniList`, iconURL: i.member.user.displayAvatarURL() })
          .setTimestamp()
          .addFields([
            {
              name: 'Other Titles',
              value: `${[
                `•\u2000\**Native:**\u2000${info.title.native || 'None'}.`,
                `•\u2000\**Romanized:**\u2000${info.title.romaji || 'None'}`,
                `•\u2000\**English:**\u2000${info.title.english || 'None'}`
              ].join("\n")}`
            },
            {
              name: 'Genres',
              value: `${client.util.joinArray(info.genres) || 'Missing Information'}`
            },
            {
              name: 'Started',
              value: `${[
                client.ani.info.months[info.startDate.month - 1],
                info.startDate.day,
                info.startDate.year
              ].filter(Boolean).join(' ') || 'Unknown'}`,
              inline: true
            },
            {
              name: query === 'anime' ? 'Episodes' : 'Chapters',
              value: `${info.episodes || info.chapters || 'Unknown'}`,
              inline: true
            },
            {
              name: query === 'anime' ? 'Duration (in minutes)' : 'Volumes',
              value: `${info.duration || info.volumes || 'Unknown'}`,
              inline: true
            },
            {
              name: '\u200b',
              value: `${client.util.truncate(toMarkdown(decode(info.description || '').replace(/<br>/g, '\n')), 1000, `*... [read more here](https://myanimelist.net/anime/${info.idMal})*`) || '\u200b'}`
            }
          ])
        );
        discoveryIndex++;
      };
      // Collector
      const discoveryPrompt = await i.editReply({ embeds: [discoveryPages.currentPage] });
      const next = '▶';
      const filter = (_, user) => user.id === i.member.user.id;
      const collector = discoveryPrompt.createReactionCollector(filter);

      await discoveryPrompt.react(next);
      let timeout = setTimeout(() => collector.stop(), 90000);

      collector.on('collect', async (reaction) => {
        if (next === reaction.emoji.name) {
          await discoveryPrompt.edit({ embeds: [discoveryPages.next()] });
        } else if (next instanceof GuildEmoji) {
          if (reaction.emoji.name === next.name) {
            await discoveryPrompt.edit({ embeds: [discoveryPages.next()] });
          }
        };

        if (discoveryPages.currentdiscoveryIndex === discoveryPages.size - 1) {
          return collector.stop();
        };

        await reaction.users.remove(i.member.user.id);
        return timeout.refresh();
      });

      collector.on('end', () => discoveryPrompt.reactions.removeAll());
    }
    else if (sub == "hentai") {
      // Oh dear.
      const hentaiCategories = ["ass", "bdsm", "cum", "doujin", "femdom", "hentai", "maid", "maids", "netorare", "gif", "orgy", "pussy", "panties", "blowjob", "ugly", "foxgirl", "uniform", "gangbang", "glasses", "tentacles", "masturbation", "yuri", "succubus", "school", "zettai-ryouiki"];
      if (!i.channel.nsfw) return i.editReply({ content: "You baka, move to an NSFW channel to execute this one." });
      if (!hentaiCategories.includes(query)) return i.editReply({ content: `First time, huh? Here, these are things that you can do.\n\n**Valid categories:** ${client.util.joinArray(hentaiCategories)}.` });
      await fetch(`https://akaneko-api.herokuapp.com/api/${query}`).then(res => res.json()).then(json => {
        i.editReply({
          content: "Here you go.", embeds: [new EmbedBuilder()
            .setColor("#fcff57")
            .setImage(json.url)]
        });
      })
    }
    else if (sub == "sauce") {
      // Check channel
      if (!i.channel.nsfw) return i.editReply({ content: "You baka, move to an NSFW channel to do that." });
      const attachment = i.options.getAttachment("image");
      if (!String(attachment.url).match(/\.(jpeg|jpg|png)$/)) return i.editReply({ content: "Baka, that's not a valid image type. We only support **JPEG**, **JPG** and **PNG**." });
      sauce.find({ url: attachment.url }).then((sauceData) => {
        const results = sauceData.results[0].data.ext_urls;
        const source = sauceData.results[0].data.source;
        if (results && source) {
          i.editReply({ content: `H-Here's the result: <${results}>, "sauce": ${source}` });
        };
        if (results && typeof source === 'undefined') {
          i.editReply({ content: `H-Here's the result: <${results}>` });
        }
        if (source && typeof results === 'undefined') {
          i.editReply({ content: `H-Here's the "sauce": ${source}` });
        }
      })

    }
    else if (sub == "malprofile") {
      // Check query immediately
      if (client.util.isProfane(query)) return i.editReply({ content: "Nah, I won't search for that one. Fix your wordings." });
      // Fetch the userquery
      const malRes = await fetch(`https://api.jikan.moe/v3/user/${encodeURI(query)}/profile`).then(res => res.json());
      // If there is no res
      if (malRes.errors) {
        let err;
        if (malRes.errors.some(a => a.status >= 500)) err = "O-Oh, AniList is having some sort of trouble. Try again later, maybe?";
        else if (malRes.errors.some(a => a.status >= 400)) err = "Sensei messed up :sob: use `/bot feedback` to report this!\n\n||**Debug info:** I tried to send an invalid request!||";
        else err = "S-Something wrong has occured! Perhaps try again later?";
        return i.editReply({ content: err });
      };
      // Set some constants for easy access
      const fav_anime = client.util.joinArrayAndLimit(malRes.favorites.anime.map((entry) => {
        return `[${entry.name}](${entry.url.split('/').splice(0, 5).join('/')})`;
      }), 1000, ' • ');
      const fav_manga = client.util.joinArrayAndLimit(malRes.favorites.manga.map((entry) => {
        return `[${entry.name}](${entry.url.split('/').splice(0, 5).join('/')})`;
      }), 1000, ' • ');
      const fav_characters = client.util.joinArrayAndLimit(malRes.favorites.characters.map((entry) => {
        return `[${entry.name}](${entry.url.split('/').splice(0, 5).join('/')})`;
      }), 1000, ' • ');
      const fav_people = client.util.joinArrayAndLimit(malRes.favorites.people.map((entry) => {
        return `[${entry.name}](${entry.url.split('/').splice(0, 5).join('/')})`;
      }), 1000, ' • ');
      // Now make our embed
      const malProfileEmbed = new EmbedBuilder()
        .setColor("#fcff57")
        .setFooter({ text: `Data sent from MyAnimeList`, iconURL: i.member.user.displayAvatarURL({ dynamic: true }) })
        .setAuthor({ name: `${malRes.username}'s Profile`, url: malRes.url })
        .setTimestamp()
        .setDescription([
          client.util.truncate((malRes.about || '').replace(/(<([^>]+)>)/ig, ''), 350, `... *[read more here](${malRes.url})*`),
          `• **Gender:** ${malRes.gender || 'Unspecified'}`,
          `• **From:** ${malRes.location || 'Unspecified'}`,
          `• **Joined:** ${moment(malRes.joined).format('dddd, do MMMM YYYY')}; ||${moment(malRes.joined).fromNow()}||`,
          `• **Last Seen:** ${moment(malRes.last_online).format('dddd, do MMMM YYYY')}; ||${moment(malRes.last_online).fromNow()}||`
        ].join('\n'))
        .addFields([
          // Thanks Mai-bot for this masterpiece of formatting :3
          {
            name: 'Anime Statics', inline: true,
            value: '```fix\n' + Object.entries(malRes.anime_stats).map(([key, value]) => {
              const cwidth = 28;
              const name = key.split('_').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
              const spacing = ' '.repeat(cwidth - (3 + name.length + String(value).length));

              return ' • ' + name + ':' + spacing + value;
            }).join('\n') + '```'
          }, {
            name: 'Manga Statics', inline: true,
            value: '```fix\n' + Object.entries(malRes.manga_stats).splice(0, 10).map(([key, value]) => {
              const cwidth = 28;
              const name = key.split('_').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
              const spacing = ' '.repeat(cwidth - (3 + name.length + String(value).length));

              return ' • ' + name + ':' + spacing + value;
            }).join('\n') + '```'
          }, {
            name: 'Favorite Anime',
            value: fav_anime.text + (!!fav_anime.excess ? ` and ${fav_anime.excess} more!` : '') || 'None Listed.'
          }, {
            name: 'Favorite Manga',
            value: fav_manga.text + (!!fav_manga.excess ? ` and ${fav_manga.excess} more!` : '') || 'None Listed.'
          }, {
            name: 'Favorite Characters',
            value: fav_characters.text + (!!fav_characters.excess ? ` and ${fav_characters.excess} more!` : '') || 'None Listed.'
          }, {
            name: 'Favorite Staffs',
            value: fav_people.text + (!!fav_people.excess ? ` and ${fav_people.excess} more!` : '') || 'None Listed.'
          }
        ]);
      i.editReply({ embeds: [malProfileEmbed] });
    }
    else if (sub == "manga") {
      // Check the query immediately before requesting.
      if (client.util.isProfane(query)) return i.editReply({ content: "Nah, I won't search for that one. Fix your wordings." });
      await fetch(`https://kitsu.io/api/edge/manga?filter[text]=${encodeURIComponent(query)}`).then(res => res.json()).then(json => {
        // Didn't want to use a short name like this but I just want to simplyfy.
        const m = json.data[0].attributes;
        // If we can't find it, reply.
        if (!m) return i.editReply({ content: "O-Oh, I don't remember seeing this. They told me they haven't, either.\n\n||Maybe fix your query?||" });
        // If result is NSFW and channel is not, reply.
        if (m.nsfw && i.channel.nsfw) return i.editReply({ content: "Uh, that's NSFW and you're not in a NSFW channel. I'm not allowed to send that here!" });
        // If result has "Nudity" or "Mature" (according to Kitsu.io) in its age rating guide and channel is not NSFW, reply.
        if (m.ageRatingGuide && (m.ageRatingGuide.includes("Nudity") || m.ageRatingGuide.includes("Mature")) && !i.channel.nsfw) return i.editReply({ content: "Uh, that has something to do with NSFW and you're not in a NSFW channel. I'm not allowed to send that here!" });
        // Now make our embed
        const embed = new EmbedBuilder()
          .setTitle(m.titles.en) // Use English title
          .setURL(`https://kitsu.io/${json.data[0].id}`) // Set the URL for title
          .setThumbnail(m.posterImage.original)
          .setDescription(
            `*The cover of this manga can be found [here](https://media.kitsu.io/manga/poster_images/${json.data[0].id}/large.jpg)*\n\n` +
            `**Description:** ${client.util.textTruncate(`${m.synopsis}`, 250, `... *(read more [here](https://kitsu.io/manga/${json.data[0].id}))*`)}`
          ) // For mobile users
          .setColor("#fcff57") // light yellawh
          .addFields([
            { name: "Type", value: client.util.toProperCase(`${m.subtype}`), inline: true },
            { name: "Status", value: client.util.toProperCase(`${m.status}`), inline: true },
            { name: "Air Date", value: `${m.startDate}`, inline: true },
            { name: "Volume Count", value: `${m.volumeCount ? m.volumeCount : "None recorded"}`, inline: true },
            { name: "Chapter Count", value: `${m.chapterCount ? m.chapterCount : "None recorded"}`, inline: true },
            { name: "Average Rating", value: `${m.averageRating.toLocaleString()}`, inline: true },
            { name: "Age Rating", value: `${m.ageRatingGuide ? m.ageRatingGuide : "None"}`, inline: true },
            { name: "Rating Rank", value: `#${m.ratingRank.toLocaleString()}`, inline: true },
            { name: "Popularity", value: `#${m.popularityRank.toLocaleString()}`, inline: true }
          ]) // Data
          .setFooter({ text: 'Powered by kitsu.io', iconURL: i.member.user.displayAvatarURL() })
          .setTimestamp();
        // Then send it
        i.editReply({ embeds: [embed] });
      })
    }
    else if (sub == "schedule") {
      let scheduleRes = await fetch(`https://api.jikan.moe/v3/schedule/${query}`).then(res => res.json());
      if (!scheduleRes || scheduleRes.error) i.editReply({ content: "O-Oh, something happened. Maybe try again in a few minutes?\n\n||Issue did not resolve in more than an hour? Do `/bot feedback` to notice my sensei!||" });
      const scheduleElapsed = Date.now() - i.createdTimestamp
      const pages = new Paginate()
      for (const info of scheduleRes[query]) {
        pages.add(new EmbedBuilder()
          .setColor("#fcff57")
          .setThumbnail(info.image_url)
          .setDescription(`${[
            `${info.score ? `**Score**: ${info.score}\n` : ''}`,
            `${info.genres.map(x => `[${x.name}](${x.url})`).join(' • ')}\n\n`,
            `${client.util.truncate(info.synopsis, 300, `... *(read more [here](${info.url}))*`)}`
          ].join('')}`)
          .setAuthor({ name: `${info.title}`, url: info.url })
          .setFooter({
            text: `${[
              `Search duration: ${Math.abs(scheduleElapsed / 1000).toFixed(2)} seconds`,
              `Page ${pages.size === null ? 1 : pages.size + 1} of ${scheduleRes[query].length}`,
              `Data sent from MyAnimeList`
            ].join(' | ')}`, iconURL: i.member.user.displayAvatarURL()
          })
          .addFields([
            { name: 'Type', value: `${info.type || 'Unknown'}`, inline: true },
            { name: 'Started', value: `${new Date(info.airing_start).toISOString().substring(0, 10)}`, inline: true },
            { name: 'Source', value: `${info.source || 'Unknown'}`, inline: true },
            { name: 'Producers', value: `${info.producers.map(x => `[${x.name}](${x.url})`).join(' • ') || 'None'}`, inline: true },
            { name: 'Licensors', value: `${info.licensors.join(' • ') || 'None'}`, inline: true },
            { name: '\u200b', value: '\u200b', inline: true }
          ])
        );
      };

      let msg = await i.editReply({ embeds: [pages.currentPage] });

      if (pages.size === 1) return;

      const schedulePrev = '◀'
      const scheduleNext = '▶'
      const scheduleTerminate = '❌'

      const scheduleFilter = (_, user) => user.id === i.member.user.id;
      const scheduleCollector = msg.createReactionCollector(scheduleFilter);
      const navigators = [schedulePrev, scheduleNext, scheduleTerminate];
      let scheduleTimeout = setTimeout(() => scheduleCollector.stop(), 90000);

      for (let i = 0; i < navigators.length; i++) {
        await msg.react(navigators[i]);
      };

      scheduleCollector.on('collect', async reaction => {

        switch (reaction.emoji.name) {
          case schedulePrev instanceof GuildEmoji ? schedulePrev.name : schedulePrev:
            msg.edit({ embeds: [pages.previous()] });
            break;
          case scheduleNext instanceof GuildEmoji ? scheduleNext.name : scheduleNext:
            msg.edit({ embeds: [pages.next()] });
            break;
          case scheduleTerminate instanceof GuildEmoji ? scheduleTerminate.name : scheduleTerminate:
            scheduleCollector.stop();
            break;
        };

        await reaction.users.remove(i.member.user.id);
        scheduleTimeout.refresh();
      });
      scheduleCollector.on('end', async () => await msg.reactions.removeAll());
    }
    else if (sub == "seiyuu") {
      const seiyuu = client.util.textRequire('../assets/graphql/Seiyuu.graphql', require);
      const seiyuuElapsed = Date.now() - i.createdTimestamp;
      let seiyuuRes = await client.ani.fetch(seiyuu, { search: query });
      if (seiyuuRes.errors && seiyuuRes.errors.some(e => e.message !== 'Not Found.')) return i.editReply({ content: "O-Oh, something happened. Maybe try again in a few minutes?\n\n||Issue did not resolve in more than an hour? Do `/bot feedback` to notice my sensei!||" });
      else if (seiyuuRes.errors && seiyuuRes.errors.some(e => e.message === 'Not Found.')) return i.editReply({ content: "O-Oh, I don't know that seiyuu. They said so, too.\n\n||This seiyuu actually exists? Try the alternative names or check the spelling!||" });
      const seiyuuEmbed = new EmbedBuilder()
        .setColor("#fcff57")
        .setThumbnail(seiyuuRes.data.Staff.image.large)
        .setAuthor({
          name: `${[
            seiyuuRes.data.Staff.name.full,
            seiyuuRes.data.Staff.name.native
          ].filter(Boolean).join(" | ")}`, url: seiyuuRes.data.Staff.siteUrl
        })
        .setDescription(`${[
          client.ani.info.langflags.find(f => f.lang.toLowerCase() === seiyuuRes.data.Staff.language?.toLowerCase())?.flag,
          client.util.truncate(toMarkdown(decode(seiyuuRes.data.Staff.description || '\u200b')), 1000, `... *(read more [here](${seiyuuRes.data.Staff.siteUrl}))*`)
        ].join('\n')}`)
        .addFields([
          {
            name: `${seiyuuRes.data.Staff.name.full} voiced these characters`,
            value: `${client.util.joinArrayAndLimit(seiyuuRes.data.Staff.characters.nodes.map(x => {
              return `[${x.name.full}](${x.siteUrl.split('/').slice(0, 5).join('/')})`;
            }), 1000, ' • ').text || 'None Found.'}`
          }, {
            name: `${seiyuuRes.data.Staff.name.full} is part of the staff of these anime`,
            value: `${client.util.joinArrayAndLimit(seiyuuRes.data.Staff.staffMedia.nodes.map(s => {
              return `[${s.title.romaji}](${s.siteUrl.split('/').slice(0, 5).join('/')})`;
            }), 1000, ' • ').text || 'None Found.'}`
          }
        ])
        .setFooter({
          text: `${[
            `Search duration: ${Math.abs(seiyuuElapsed / 1000).toFixed(2)} seconds`,
            `Data sent from AniList`
          ].join(' | ')}`, iconURL: i.member.user.displayAvatarURL()
        });

      await i.editReply({ embeds: [seiyuuEmbed] });
    }
    else if (sub == "waifu") {
      const waifu = waifuDB.data[Math.floor(Math.random() * (waifuDB.data.length))];
      const waifuEmbed = new EmbedBuilder()
        .setColor("#fcff57") // light yellawh
        .setAuthor({ name: client.util.truncate([waifu.name, waifu.original_name].filter(Boolean).join('\n'), 200) })
        .setDescription(`***From:** ${waifu.appearances[0].name}*`)
        .setImage(waifu.display_picture)
        .setTimestamp()
        .setFooter({ text: `${waifu.likes} likes`, iconURL: i.member.user.displayAvatarURL() });
      i.editReply({ embeds: [waifuEmbed] });
    }
    else if (sub == "watch") {
      const channel = i.options.getChannel("channel");
      // Check
      if (!channel && !i.guild.settings.anisched_id) return i.editReply({ content: "You baka, no channel's been set for me to announce. You only have to do this once!" })
      if (!client.db) return i.editReply({
        content: "O-Oh, the database is not connected at the moment."
      })
      const anilistId = await client.util.getMediaId(query);
      if (!anilistId) return i.editReply({ content: "Have you made a typo or something? That one doesn't exist, baka." });
      if (channel && channel.type == "GUILD_VOICE") return i.editReply({ content: "No, I can't speak in there for you nor anyone. Give me a proper text channel." });
      // Safety step
      if (!i.guild.settings) return i.guild.update({ anisched_data: [], anisched_id: null });
      if ((i.guild.settings.anisched_data).includes(anilistId)) return i.editReply({ content: "Hey, wash your face. That one's already in." });
      const media = (await client.ani.fetch("query($id: Int!) { Media(id: $id) { id status title { native romaji english } } }", { id: anilistId })).data.Media;
      if (!["NOT_YET_RELEASED", "RELEASING"].includes(media.status)) return i.editReply({ content: "Hey, that's not airing. It's probably not an upcoming one, too." });
      // Final stuff
      let idArray = (i.guild.settings.anisched_data).concat([media.id])
      await i.guild.update({ anisched_data: [...new Set(idArray)], anisched_id: channel ? channel.id : i.guild.settings.anisched_id }).then(() => {
        return i.editReply({ content: "Now tracking airing episodes for that one in that channel!" });
      });
    } else if (sub == "unwatch") {
      if (!client.db) return i.editReply({
        content: "O-Oh, the database is not connected at the moment."
      })
      const anilistId = await client.util.getMediaId(query);
      if (!anilistId) return i.editReply({ content: "Have you made a typo or something? That one doesn't exist, baka." });
      // Safety step
      if (!i.guild.settings) return i.editReply({ content: "This server doesn't even have any, baka." });
      if (!(i.guild.settings.anisched_data).includes(anilistId)) return i.editReply({ content: "Hey, wash your face. That one's not in." });
      const media = (await client.ani.fetch("query($id: Int!) { Media(id: $id) { id status title { native romaji english } } }", { id: anilistId })).data.Media;
      let updatedArr = client.util.delete(i.guild.settings.anisched_data, media.id);
      await i.guild.update({ anisched_data: [...new Set(updatedArr)] }).then(() => {
        return i.editReply({ content: "Removed that one from this server's watchlist!" });
      });
    }
  }
}
