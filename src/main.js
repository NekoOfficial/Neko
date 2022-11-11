// make this file minimum
require("dotenv").config();
require(`./struct/extend/Discord`);

const Client = require(`./struct/Client`);
const c = require(`./config.js`);
const dev = process.argv.includes("--dev");

new Client(c, dev).login();
