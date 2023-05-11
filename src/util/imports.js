// This file is mainly to reduce the loads on the command files, making those files easier to maintain because whenever I have to make changes, I would have to scroll down 100-200 lines of code.
// That process is tiring, so this is a solution for it.
// When I want to change something, I'd just go here.
const { SlashCommandBuilder } = require("discord.js");

const animeImports = new SlashCommandBuilder()
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
	)

const botImports = new SlashCommandBuilder()
	.setName("bot")
	.setDescription("Core commands.")
	.addSubcommand(cmd => cmd
		.setName("eval")
		.setDescription("evaluate JS code. Only my sensei can do this!")
		.addStringOption(option => option.setName("query").setDescription("The code to execute").setRequired(true))
	)
	.addSubcommand(cmd => cmd
		.setName("ping")
		.setDescription("test my message reaction by sending the time I reacted.")
	)
	.addSubcommand(cmd => cmd
		.setName("terms")
		.setDescription("read my neat version of Terms of Service.")
	)
	.addSubcommand(cmd => cmd
		.setName("vote")
		.setDescription("vote for me on top.gg to show some support!")
	)
	.addSubcommand(cmd => cmd
		.setName("feedback")
		.setDescription("is anything wrong? Having good ideas? Share it!")
		.addStringOption(option => option
			.setName("type")
			.setDescription("The type of this feedback")
			.setRequired(true)
			.addChoices(...[
				{ name: "issue", value: "Issue" },
				{ name: "suggestion", value: "Suggestion" }
			])
		)
		.addStringOption(option => option.setName("query").setDescription("The issue/suggestion you wanna send."))
		.addAttachmentOption(option => option.setName("attachment").setDescription("Literally the attachment."))
	)

const funImports = new SlashCommandBuilder()
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
	)
	.addSubcommand(cmd => cmd
		.setName('pooh')
		.setDescription('If you know the meme with that luxury pooh, yes, you can now make one.')
		.addStringOption(option => option.setName('normal').setDescription('The normal pooh text').setRequired(true))
		.addStringOption(option => option.setName('pro').setDescription('The luxury pooh text').setRequired(true))	
	)
	.addSubcommand(cmd => cmd
		.setName('drake')
		.setDescription('You know him. Now available in Discord™')
		.addStringOption(option => option.setName('no').setDescription('The disliked context').setRequired(true))
		.addStringOption(option => option.setName('yes').setDescription('The preffered context').setRequired(true))	
	)
	.addSubcommand(cmd => cmd
		.setName('aliens')
		.setDescription('You know him with his iconic expression. Now available in Discord™')
		.addStringOption(option => option.setName('top').setDescription('The top context').setRequired(true))
		.addStringOption(option => option.setName('bottom').setDescription('The bottom context').setRequired(true))	
	)

const modImports = new SlashCommandBuilder()
	.setName("moderation")
	.setDescription("moderation tools, apart from Discord's built-in ones.")
	.addSubcommand(cmd => cmd
		.setName("warn")
		.setDescription("warn a user, and log their infraction.")
		.addUserOption(option => option
			.setName("member")
			.setDescription("...just the server member to warn.")
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName("reason")
			.setDescription("...well, this is recommended to put in.")
		)
		.addBooleanOption(option => option
			.setName("notify")
			.setDescription("should I notify the user? Defaults to no.")
		)
	)
	.addSubcommand(cmd => cmd
		.setName("timeout")
		.setDescription("timeout a user, and log it to their infraction data.")
		.addUserOption(option => option
			.setName("member")
			.setDescription("...just the server member to timeout.")
			.setRequired(true)
		)
		.addIntegerOption(option => option
			.setName("time")
			.setDescription("...just the time for that timeout. Format is minute.")
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName("reason")
			.setDescription("...well, this is recommended to put in.")
		)
	)
	.addSubcommand(cmd => cmd
		.setName("untimeout")
		.setDescription("untimeout a user.")
		.addUserOption(option => option
			.setName("member")
			.setDescription("...just the server member.")
			.setRequired(true)
		)
	)
	.addSubcommand(cmd => cmd
		.setName("ban")
		.setDescription("ban a user, and log it to their infraction data.")
		.addUserOption(option => option
			.setName("member")
			.setDescription("...just the server member to ban.")
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName("reason")
			.setDescription("...well, this is now enforced.")
			.setRequired(true)
		)
	)
	.addSubcommand(cmd => cmd
		.setName("unban")
		.setDescription("unban a user.")
		.addStringOption(option => option
			.setName("id")
			.setDescription("...just the user's ID.")
			.setRequired(true)
		)
	)
	.addSubcommand(cmd => cmd
		.setName("clear")
		.setDescription("clear messages in this channel.")
		.addIntegerOption(option => option
			.setName("number")
			.setDescription("...just the number of messages to delete. Max 99 and younger than 1 week.")
			.setRequired(true)
		)
	)
	.addSubcommand(cmd => cmd
		.setName("clone")
		.setDescription("deletes a channel, then clone that channel with NO CONTENT in it.")
		.addChannelOption(option => option
			.setName("channel")
			.setDescription("...literally the channel to clone.")
			.setRequired(true)
		)
	)
	.addSubcommand(cmd => cmd
		.setName("infractions")
		.setDescription("check a member's rapsheet.")
		.addUserOption(option => option
			.setName("member")
			.setDescription("...just the server member.")
			.setRequired(true)
		)
	)
	.addSubcommand(cmd => cmd
		.setName("kick")
		.setDescription("kick a user, and log it to their infraction data.")
		.addUserOption(option => option
			.setName("member")
			.setDescription("...just the server member to kick.")
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName("reason")
			.setDescription("...well, this is now enforced.")
			.setRequired(true)
		)
	)
	.addSubcommand(cmd => cmd
		.setName("unwarn")
		.setDescription("delete an infraction, or all infractions of a given member.")
		.addUserOption(option => option
			.setName("member")
			.setDescription("...just the server member to kick.")
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName("type")
			.setDescription("...just the action you want to take.")
			.addChoices(...[
				{ name: "one", value: "one" },
				{ name: "all", value: "all" }
			])
			.setRequired(true)
		)
		.addIntegerOption(option => option
			.setName("index")
			.setDescription("...if you chose \"one\", you'll need to specify this.")
		)
	)

const musicImports = new SlashCommandBuilder()
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
				{ name: "nightcore", value: "nc" },
				{ name: "pitch", value: "p" },
				{ name: "distort", value: "d" },
				{ name: "8d", value: "8d" },
				{ name: "bassboost", value: "bb" },
				{ name: "speed", value: "dt" },
				{ name: "vaporwave", value: "vp" }
			])
		)
	)

const utilImports = new SlashCommandBuilder()
	.setName("utility")
	.setDescription("The name says it all.")
	.addSubcommand(cmd => cmd
		.setName("avatar")
		.setDescription("Display one's avatar.")
		.addUserOption(option => option.setName("member").setDescription("...just the server member.").setRequired(true))
	)
	.addSubcommand(cmd => cmd
		.setName("urban")
		.setDescription("The one dictionary you love.")
		.addStringOption(option => option.setName("word").setDescription("...just the word you want to define.").setRequired(true))
	)
	.addSubcommand(cmd => cmd
		.setName("banner")
		.setDescription("Display one's banner.")
		.addUserOption(option => option.setName("member").setDescription("...just the server member.").setRequired(true))
	)
	.addSubcommand(cmd => cmd
		.setName("channel")
		.setDescription("Display a channel's information.")
		.addChannelOption(option => option.setName("channel").setDescription("...just the channel.").setRequired(true))
	)
	.addSubcommand(cmd => cmd
		.setName("server")
		.setDescription("Display this server's information.")
	)
	.addSubcommand(cmd => cmd
		.setName("github")
		.setDescription("Display a (public) GitHub repo's information.")
		.addStringOption(option => option.setName("name").setDescription("Format: [repo owner]/[repo name].").setRequired(true))
	)
	.addSubcommand(cmd => cmd
		.setName("npm")
		.setDescription("Display an npm package's information.")
		.addStringOption(option => option.setName("name").setDescription("...just the package's name.").setRequired(true))
	)
	.addSubcommandGroup(cmd => cmd
		.setName("notepad")
		.setDescription("A notepad, but you can do stuff with it.")
		.addSubcommand(cmd => cmd
			.setName("new")
			.setDescription("Make a new notepad.")
			.addStringOption(option => option.setName("name").setDescription("...just the note's name.").setRequired(true))
			.addStringOption(option => option.setName("content").setDescription("...just the note's content. Max 125 characters.").setRequired(true))
		)
		.addSubcommand(cmd => cmd
			.setName("view")
			.setDescription("View your saved note file.")
		)
		.addSubcommand(cmd => cmd
			.setName("delete")
			.setDescription("Delete your saved note file.")
		)
	)
	
module.exports = { animeImports, botImports, funImports, modImports, musicImports, utilImports };