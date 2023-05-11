const settings = function () {
  return this.client.settings.guild.getDefaults(this.id);
};

const prefix = function () {
  return this.client.db ? this.settings.prefix : this.client.config.prefix;
};

const blacklisted = function () {
  return this.client.user.settings.blacklist.includes(this.id);
};

const syncSettings = function () {
  return this.client.settings.guild.sync(this.id);
};

const update = function (obj) {
  return this.client.settings.guild.update(this.id, obj);
};

const clear = function (guild) {
  return this.client.settings.guild.delete(guild);
};

module.exports = { settings, prefix, blacklisted, syncSettings, update, clear };
