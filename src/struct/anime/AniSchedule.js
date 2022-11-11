// This is a big big one - a very hard thing to make.
// Big feature that once I complete it I'll literally take a 1 week break
// Imo the difficulty to make this work is 10/10; at least there are references on the Internet
// First, call out literally everything we'll need:
require('moment-duration-format');
const { duration } = require('moment');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const constants = require(`${process.cwd()}/src/util/anilist`);

// Off we go:
module.exports = class AniSchedule {
  constructor(client) {
    // Safety step
    Object.defineProperty(this, "client", { value: client });

    // Whether this is enabled or not
    this.enabled = true; // Not ready for use
    // The queued notifications for this instance
    this.queuedNotifications = [];
    // Media formats from the constants file
    this.info = {
      mediaFormat: constants.mediaFormat,
      months: constants.months,
      defaultgenres: constants.mediaGenres,
      langflags: constants.langflags
    };
    // Don't know if this works
    this.schedule = this.client.util.textRequire(`${process.cwd()}/src/assets/graphql/Schedule.graphql`, require);
  };
  // To the real things
  // Fetch the data
  fetch(query, variables) {
    return this.client.util.graphqlCheck(query, variables);
  };
  // Fetch all media IDs from the guilds' data
  getAllWatched() {
    return new Promise(async resolve => {
      // Very complicated isn't it
      // This doesn't have a fair shortcut (this must be able to get ALL the airing IDs)
      const list = await this.client.db.collection("guild").find({}).toArray().catch(() => []);
      return resolve([...new Set(list.flatMap(guild => guild.anisched_data))]);
    });
  };
  // Embed-ify a media object
  // Thanks TehNut!
  getAnnouncementEmbed(entry, date) {
    const sites = ['Amazon', 'Animelab', 'AnimeLab', 'Crunchyroll', 'Funimation', 'Hidive', 'Hulu', 'Netflix', 'Viz'];

    const watch = entry.media.externalLinks?.filter(x => sites.includes(x.site)).map(x => {
      return `[${x.site}](${x.url})`;
    }).join(' • ') || [];

    const visit = entry.media.externalLinks?.filter(x => !sites.includes(x.site)).map(x => {
      return `[${x.site}](${x.url})`;
    }).join(' • ') || [];

    return new EmbedBuilder()
      .setColor(entry.media.coverImage.color || 'ffc0cb')
      .setThumbnail(entry.media.coverImage.large)
      .setAuthor({ name: 'AniSchedule' })
      .setTimestamp(date)
      .setDescription(`${[
        `Episode **${entry.episode}** of **[${entry.media.title.romaji}](${entry.media.siteUrl})**`,
        `${entry.media.episodes === entry.episode ? ' **(Final Episode)** ' : ' '}`,
        `has just aired.${watch ? `\n\nWatch: ${watch}` : '*None yet*'}${visit ? `\n\nVisit: ${visit}` : '*None yet*'}`,
        `\n\nIt may take some time to appear on the above service(s).`
      ].join('')}`)
      .setFooter({
        text: [
          `${entry.media.format ? `Format: ${constants.mediaFormat[entry.media.format] || 'Unknown'}` : ''}`,
          `${entry.media.duration ? `Duration: ${duration(entry.media.duration * 60, 'seconds').format('H [hr] m [minute]')}  ` : ''}`,
          `${!!entry.media.studios.edges.length ? `Studio: ${entry.media.studios.edges[0].node.name}` : ''}`
        ].filter(Boolean).join('  •  ')
      });
  };
  // Get the date of the next (no.) days
  getFromNextDays(days = 1) {
    return new Date(new Date().getTime() + (864e5 * days));
  };
  // Handle the scheduler: Fetch the data, then append the timeout
  async handleSchedules(nextDay, page) {
    const watched = await this.getAllWatched();

    if (watched[0] == undefined) {
      if (this.enabled) {
        this.client.util.error("Missing data from database", "[Scheduler]");
      };
      return;
    };

    const res = await this.fetch(this.schedule, { page, watched, nextDay });

    if (res.errors) {
      return this.client.util.error(`Fetch Error: ${res.errors.map(err => err.message)}`, "[Scheduler]");
    };

    for (const e of res.data.Page.airingSchedules) {
      const date = new Date(e.airingAt * 1000)
      if (this.queuedNotifications.includes(e.id)) continue;

      this.client.util.success(`Tracking Announcement for Episode \x1b[36m${e.episode
        }\x1b[0m of \x1b[36m${e.media.title.romaji || e.media.title.userPreferred
        }\x1b[0m in \x1b[36m${duration(e.timeUntilAiring, 'seconds').format('H [hours and] m [minutes]')
        }\x1b[0m`, `[Scheduler]`);

      this.queuedNotifications.push(e.id);

      setTimeout(() => this.makeAnnouncement(e, date), e.timeUntilAiring * 1000);
    };

    if (res.data.Page.pageInfo.hasNextPage) {
      this.handleSchedules(nextDay, res.data.Page.pageInfo.currentPage + 1);
    };
  };
  // Pretty obvious - initialize the scheduler
  async init() {
    if (!this.enabled) return; else if (!this.client.db) {
      this.client.util.error("The database is having issues", "[Scheduler]");
    }
    this.client.util.success("Loaded AniSchedule", "[Scheduler]")
    return this.loop(() => {
      return this.handleSchedules(Math.round(this.getFromNextDays().getTime() / 1000))
    }, 24 * 60 * 60 * 1000);
  };
  // Loop - used here
  loop(fn, delay, ...param) {
    fn();
    return setInterval(fn, delay, ...param);
  };
  // Send the announcement to the channel
  async makeAnnouncement(entry, date) {
    this.queuedNotifications = this.queuedNotifications.filter(e => e !== entry.id);
    const embed = this.getAnnouncementEmbed(entry, date);
    const list = await this.client.db.collection("guild").find({}).toArray();
    if (!list) {
      if (this.enabled) {
        this.client.util.error("Missing data from database", "[Scheduler]")
      };
      return;
    };

    for (const g of list) {
      if (!g?.anisched_data?.includes(entry.media.id)) {
        continue;
      };

      const channel = await this.client.channels.cache.get(g.anisched_id);

      const bitFieldforChannel = new PermissionsBitField(channel.permissionsFor(channel.guild.members.me))

      if (!channel || !bitFieldforChannel.has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
        this.client.util.error(`Announcement for ${entry.media.title.romaji || entry.media.title.userPreferred
          } has \x1b[31mfailed\x1b[0m in ${channel?.guild?.name || g.anisched_id
          } because ${channel?.guild ? `of \x1b[31mmissing\x1b[0m 'SEND_MESSAGES' and/or 'EMBED_LINKS' permissions.`
            : `such channel \x1b[31mdoes not exist\x1b[0m.`
          }`, "[Scheduler]");
        continue;
      };

      await channel.send({ embeds: [embed] })
        .then((msg) => {
          this.client.util.success(`Announcing episode \x1b[36m${entry.media.title.romaji || entry.media.title.userPreferred
            }\x1b[0m to \x1b[36m${channel.guild.name
            }\x1b[0m @ \x1b[36m${channel.id
            }\x1b[0m`);
        }).catch(err => {
          this.client.util.error(`Announcement for \x1b[36m${entry.media.title.romaji || entry.media.title.userPreferred
            }\x1b[0m : \x1b[31mFailed:\x1b[0m${err.name}`);
        });
    };

    return;
  };
}
