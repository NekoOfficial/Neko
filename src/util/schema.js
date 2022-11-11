// It's like how you work with PostgreSQL, but in a different way
// Methods are defined in the Settings structure, value defaults are set here
// Have fun flooding the database :3
module.exports = {
  guild: {
    xp: false,
    exception: [],
    levelup: false,
    eco: false,
    mute: null,
    starboard: { channel: null, limit: 2 },
    anisched_id: null,
    anisched_data: []
  },
  user: {
    osuign: null,
    defaultmode: 0,
    bank: null,
    wallet: null,
    alltime: 0,
    current: 0,
    timestamp: 0,
    shard: null,
    bio: "No bio written.",
    background: null,
    inventory: [],
    note: { name: null, content: null }
  },
  member: {
    xp: 0,
    level: 0,
    infraction: 0,
    infraction_data: []
  },
  client: {
    guildBlacklist: [],
    blacklist: []
  }
};
