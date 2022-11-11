/**
 * Alias
 * this.client.settings.members.update(`${guild.id}.${member.id}`, { points: 0 })
 * to just
 * member.update({ points: 0 })
 */
const update = function (obj) {
  return this.client.settings.member.update(`${this.guild.id}.${this.id}`, obj);
};

const settings = function () {
  const id = `${this.guild.id}.${this.id}`;
  return this.client.settings.member.getDefaults(id);
};

const xp = function () {
  return parseInt(this.settings.xp);
};

const level = function () {
  return this.settings.level;
};

const syncSettings = function () {
  return this.client.settings.member.sync(`${this.guild.id}.${this.id}`);
};

const syncSettingsCache = function () {
  if (!this.client.settings.member.cache.has(`${this.guild.id}.${this.id}`)) {
    return this.syncSettings();
  }
};

const setLevel = function (level) {
  if (isNaN(level)) throw new Error("Level cannot be NaN");
  return this.update({ level });
};

const giveXP = async function (amount) {
  const xp = parseInt(this.settings.xp) + parseInt(amount);

  // Guard against overflow.
  if (xp >= Number.MAX_SAFE_INTEGER) return false;

  // Validate against any accidents.
  if (isNaN(xp)) throw new Error("Cannot give NaN XP to member.");

  return this.update({ xp });
};

const takeXP = function (amount) {
  return this.giveXP(-amount);
};

module.exports = {
  update,
  settings,
  xp,
  level,
  syncSettings,
  syncSettingsCache,
  setLevel,
  giveXP,
  takeXP
};
