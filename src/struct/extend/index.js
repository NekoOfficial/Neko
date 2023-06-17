// Call out every extended things in this folder:
const { GuildMember, User, Guild } = require("discord.js");

const guild = require("./guild.js");
Object.defineProperties(Guild.prototype, {
  settings: { get: guild.settings },
  prefix: { get: guild.prefix },
  language: { get: guild.language },
  syncSettings: { value: guild.syncSettings },
  update: { value: guild.update },
  delete: { value: guild.clear }
});

const member = require("./member.js");
Object.defineProperties(GuildMember.prototype, {
  update: { value: member.update },
  settings: { get: member.settings },
  xp: { get: member.xp },
  level: { get: member.level },
  syncSettings: { value: member.syncSettings },
  syncSettingsCache: { value: member.syncSettingsCache },
  setLevel: { value: member.setLevel },
  giveXP: { value: member.giveXP },
  takeXP: { value: member.takeXP }
});

const user = require("./user.js");
Object.defineProperties(User.prototype, {
  settings: { get: user.settings },
  owner: { get: user.owner },
  cooldown: { get: user.cooldown },
  blacklisted: { get: user.blacklisted },
  update: { value: user.update },
  syncSettings: { value: user.syncSettings },
  syncSettingsCache: { value: user.syncSettingsCache },
  properTag: { value: user.properTag }
});
