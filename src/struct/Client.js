"use strict";
// Discord
const { Client, Collection } = require("discord.js");
const { REST } = require("discord.js");
const { Routes } = require("discord-api-types/v10");
// Core util
const fs = require("fs");
const { join } = require("path");
const { MongoClient } = require("mongodb");
// Structure files
const Command = require(`./cmd/Commands`);
const Settings = require("./Settings");
const Util = require("./util/Util")
const Collections = require(`./util/Collections`);
const Poster = require(`./util/Topgg`);
const AniSchedule = require(`./anime/AniSchedule`)
// const Manager = require("./util/Player.js");
// Utilities
const processEvents = require(`${process.cwd()}/src/util/event`);
const schema = require(`${process.cwd()}/src/util/schema`);
const { TOKEN, TOKEN_DEV } = process.env;

// Start
class NekoClient extends Client {
  constructor(settings = {}, dev = false) {
    super(settings.client);
    // Pre-set variables.
    this.dev = dev;
    this.util = new Util(this);
    this.ani = new AniSchedule(this);
    this.commands = new Collection();
    this.collections = new Collections();
    this.poster = new Poster(this)
    // this.manager = new Manager(this);
    this.config = settings;
    this.dbClient = null;
    this.db = null;
    this.messages = { received: 0, sent: 0 };
    this.once("ready", this.onReady.bind(this));

    // Log the initialization
    this.util.warn("Logging in...", "[Warn]");

    // Settings set
    this.settings = {
      guild: new Settings(this, "guild", schema.guild),
      user: new Settings(this, "user", schema.user),
      client: new Settings(this, "client", schema.client),
      member: new Settings(this, "member", schema.member)
    };

    // And build commands
    new Command(this).build(`../../cmd/`);
  }

  // Collection
  collection(collect = []) {
    for (const col of collect) {
      this.collections.add(col);
    }
    return this;
  }

  // Event listener
  listenToEvent(events = [], config = {}) {
    for (const event of events) {
      process.on(event, (...args) => {
        if (config.ignore && typeof config.ignore === "boolean") {
          return;
        } else {
          return processEvents(event, args, this);
        }
      });
    }
  }

  // Slash command deployment
  async deploy() {
    const commandData = [];
    const commands = fs.readdirSync(`${process.cwd()}/src/cmd`).filter(cmd => cmd.endsWith(".js"));

    for (const command of commands) {
      const Command = require(`../cmd/${command}`);
      const cmd = new Command();
      const cmdData = cmd.data.toJSON();
      commandData.push(cmdData);
    }

    const rest = new REST({ version: "10" }).setToken(this.dev ? TOKEN_DEV : TOKEN);

    try {
      await rest.put(Routes.applicationCommands(this.dev ? this.config.testBot : this.config.mainBot), { body: commandData });
    } catch (e) {
      console.error(e);
    }
  }

  // Event loader
  loadEvent() {
    const eventpath = `${process.cwd()}/src/events/Discord`;
    const eventdir = fs.readdirSync(eventpath);
    for (const dir of eventdir.filter(x => !x.startsWith("_"))) {
      const file = require(join(eventpath, dir));
      this.on(dir.split(".")[0], file.bind(null, this));
    }

    const musicpath = `${process.cwd()}/src/events/Lavalink`;
    const musicdir = fs.readdirSync(musicpath);
    for (const dir of musicdir.filter(x => !x.startsWith("_"))) {
      const file = require(join(musicpath, dir));
      this.manager.on(dir.split(".")[0], file.bind(null, this));
    }
    return this.util.success(`Loaded ${eventdir.length + musicdir.length} events`, "[Event]");
  }

  // On ready, do these
  onReady() {
    this.ready = true;
    this.util.success(`Logged in as ${this.user.tag}`, "[Client]");
  }

  // Initilize everything and log us in
  async init() {
    // Load stuff: collections, events, slash
    this.collection(this.config.col);
    this.listenToEvent(this.config.process, { ignore: false });
    this.deploy();
    this.loadEvent();

    // Connect our database.
    const url = process.env.MONGO;
    this.dbClient = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Then log this
    this.util.success("Connected to database", "[Database]");

    // Store reference to our database.
    this.db = this.dbClient.db();
    
    // Then init the anischedule thingy.
    this.ani.init();

    // Initialize settings.
    for (const [name, settings] of Object.entries(this.settings)) {
      await settings.init();
    }
    // Since every functions needs to be passed first so we don't need a lot of details here.
    this.util.success("Loaded commands and settings", "[General]");
  }

  // Finally login. Check if we have to use the dev bot.
  async login() {
    await this.init();
    return super.login(this.dev ? TOKEN_DEV : TOKEN);
  }
}

// Finally export the class
module.exports = NekoClient;
