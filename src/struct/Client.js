// we work with esmodule now
// commonjs is not recommended for serverless
// and we move from commonjs up anyway
import { YorClient } from "yor.ts";
import Utility from "./Utilities";
import Database from "./Database";
import schema from "../assets/const/schema";
// import commands
import Fun from "../cmd/fun";
import Util from "../cmd/utility";
import My from "../cmd/my";
import Anime from "../cmd/anime";
import Moderate from "../cmd/moderate";
import OsuGame from "../cmd/osugame";

export default class NekoClient extends YorClient {
  // we walk exactly like how we written server neko
  constructor(env) {
    // init the client
    // check dev mode
    super({
      application: {
        id: env.APPID,
        publicKey: env.PUBKEY
      },
      token: env.TOKEN
    });
    // env sent by the request
    this.env = env;
    // database prop
    // if it's not connected return null
    this.db = env.database;
    // database settings
    this.settings = {
      guilds: new Database(this, "guilds"),
      members: new Database(this, "members"),
      users: new Database(this, "users"),
      store: new Database(this, "store")
    };
    // util
    // init this class and then use it everywhere
    this.util = new Utility(this, env);
  }
  async start() {
    // because using fs is against cfworkers' global async i/o rule
    // we have to call every single command in here
    this.registerCommands([
      new Moderate(),
      new Fun(), 
      new Util(), 
      new My(), 
      new Anime(), 
      new OsuGame
    ]);
  }
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const pathname = url.pathname;
    // init our db
    // populate the db with our schema
    // useful line when migrating or initializing a new one
    // because we only create tables if they don't exist anyway
    await schema(env.database);
    // write settings in cache
    for (const [name, settings] of Object.entries(this.settings)) {
      await settings.init();
    };
    // if we need to configure anything extra later
    // we can just make a file and serve it on a different endpoint
    // very convenient setup
    if (pathname.startsWith("/interactions")) {
      // disallow any other method than post
      if (request.method != "POST") return new Response("Method not allowed", { status: 405 })  
      // handle interactions
      const promise = this.handleInteraction(request)
      ctx.waitUntil(promise)
      // before handling any command, parse this client's properties into ctx
      // so we can use these properties in any command
      ctx.client = this;
      // handle the command
      const response = await promise;
      return new Response(JSON.stringify(response));
    }
    // update commands
    if (pathname.startsWith("/deploy")) {
      try {
        const response = await this.deployCommands();
        return new Response(JSON.stringify(response));
      }
      catch (error) {
        return new Response(JSON.stringify(error));
      }
    }
    // disallow any other unimplemented endpoint use
    return new Response("Not found", { status: 404 })
  }
}