const fetch = require('node-fetch');

// A mock for not using any kind of packages (it's just one simple task why bother?)
module.exports = class Topgg {
  constructor(client) {
    this.client = client;
    this.token = process.env["DBL_TOKEN"];
  };
  async post() {
    await this._request("POST", 'bots/stats', {
      server_count: this.client.guilds.cache.size,
      shard_id: undefined,
      shard_count: 1
    }).catch(() => {
      this.client.util.error("Something happened, debugging might work", "[Top.gg]");
    });

    return this.client.util.success("Posted statistics to top.gg", "[Top.gg]");
  }
  async _request(method, path, body) {
    const headers = new fetch.Headers();

    headers.set("Authorization", this.token);
    headers.set("Content-Type", "application/json");

    let url = `https://top.gg/api/${path}`;

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(body),
    });

    let responseBody;
    if (response.headers.get("Content-Type")?.startsWith("application/json")) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    if (!response.ok) {
      this.client.util.error(`${response.statusText}`, "[Top.gg]");
    }

    return responseBody;
  };
};