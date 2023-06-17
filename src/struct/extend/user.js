const { Collection } = require("discord.js");
const cool = new Collection();

const settings = function () {
  return this.client.settings[this.id === this.client.user.id ? "client" : "user"].getDefaults(this.id);
};

// Discord is enforcing a new username system - removing discriminator
// This is making the discriminator turning into 0s - that's bad, and we need to fix it
// D.js v14.12 has this, but we'll just implement one here
const properTag = function () {
  let propTag;
  // Check if the discrim part is 0...
  if (this.tag.toString().split('#')[1] != "0") propTag = this.tag; 
  // ...if it is, we just take the username
  else propTag = this.tag.toString().split('#')[0];
  return propTag;
};

/**
 * Check if this user is the bot owner.
 * @returns {Boolean}
 */
const owner = function () {
  return this.id === this.client.config.owners;
};

/**
 * Cooldown on command
 */
const cooldown = function () {
  return cool;
};

/**
 * Check if this user is blacklisted.
 * @returns {Boolean}
 */
const blacklisted = function () {
  return this.client.user.settings.blacklist.includes(this.id);
};

const update = function (obj) {
  return this.client.settings[this.id === this.client.user.id ? "client" : "user"].update(this.id, obj);
};

const syncSettings = function () {
  return this.client.settings[this.id === this.client.user.id ? "client" : "user"].sync(this.id);
};

/**
 * Sync only if the entry is not cached.
 */
const syncSettingsCache = function () {
  if (!this.client.settings[this.id === this.client.user.id ? "client" : "user"].cache.has(this.id)) {
    return this.syncSettings();
  }
};

module.exports = {
  settings,
  owner,
  cooldown,
  blacklisted,
  update,
  syncSettings,
  syncSettingsCache,
  properTag
};
