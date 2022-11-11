require("moment-duration-format");
const moment = require("moment");
const _fetch = require("node-fetch");
const fs = require("fs");
const list = new Intl.ListFormat('en');

module.exports = class Util {
  constructor(client) {
    this.client = client;
    this.splitRegex = /\b/;
    this.placeholder = "*";
    this.replaceRegex = /\w/g;
  }
  clean(string) {
    return string.split(this.splitRegex).map((word) => {
      return this.client.util.isProfane(word) ? this.replaceWord(word) : word;
    }).join(this.splitRegex.exec(string)[0]);
  }
  replaceWord(string) {
    return string
      .replace(this.regex, '')
      .replace(this.replaceRegex, this.placeHolder);
  }
  createBar(player) {
    try {
      if (!player.queue.current) return `"["▬""─".repeat(size - 1)}]\n00:00:00 / 00:00:00`;
      let current = player.queue.current.duration !== 0 ? player.position : player.queue.current.duration;
      let total = player.queue.current.duration;
      let size = 10;
      let bar = String("[") + String("▬").repeat(Math.round(size * (current / total))) + String("─").repeat(size - Math.round(size * (current / total))) + String("]");
      return `${bar}\n${new Date(player.position).toISOString().substr(11, 8) + " / " + (player.queue.current.isStream ? "◉ LIVE" : new Date(player.queue.current.duration).toISOString().substr(11, 8))}`;
    } catch (e) {
      this.error(String(e.stack).bgRed);
    }
  }
  format(player, millis) {
    try {
      var h = Math.floor(millis / 3600000),
        m = Math.floor(millis / 60000),
        s = ((millis % 60000) / 1000).toFixed(0);
      // I've kept this typo without knowing its existence for 99999 years.
      if (h < 1) return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + "`, or `" + Math.floor(millis / 1000) + " seconds";
      else if (player.queue.current.isStream) return "◉ LIVE";
      else return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + "`, or `" + Math.floor(millis / 1000) + " seconds";
    } catch (e) {
      this.error(String(e.stack));
    }
  }
  random(arr) {
    return arr[~~(Math.random() * arr.length)];
  }
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  success(message, title = "Success") {
    return console.log("\x1b[32m", title, "\x1b[0m", message);
  }
  warn(message, title = "Warn") {
    return console.log("\x1b[33m", title, "\x1b[0m", message);
  }
  error(message, title = "Error") {
    return console.log("\x1b[31m", title, "\x1b[0m", message);
  }
  checkCooldown(interaction, command) {
    let cooldown = interaction.user.cooldown.get(command.name);
    if (command.cooldown && cooldown + command.cooldown > Date.now()) {
      return {
        accept: false,
        timeLeft: moment.duration(cooldown + command.cooldown - Date.now()).format("m [minute] s [second]")
      };
    }
    if (command.cooldown) {
      interaction.user.cooldown.set(command.name, Date.now());
    }
    setTimeout(() => interaction.user.cooldown.delete(command.name), command.cooldown);
    return { accept: true };
  }
  _checkURL(url) {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(url);
  }
  escapeRegex(str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  }
  progressBar(value, maxValue, size) {
    const percentage = value / maxValue;
    const progress = Math.round(size * percentage);
    const emptyProgress = size - progress;

    const progressText = "▇".repeat(progress);
    const emptyProgressText = "—".repeat(emptyProgress);
    const percentageText = Math.round(percentage * 100) + "%";

    const bar = "```[" + progressText + emptyProgressText + "]" + ` ${percentageText}` + "```";
    return bar;
  }
  async checkUsername(user) {
    const validCharSet = /^[a-zA-Z0-9]+$/;
    if (!validCharSet.test(user)) return false;
    const { username } = await _fetch(`https://osu.ppy.sh/api/get_user?k=${process.env["OSU_KEY"]}&u=${user}&m=1`).then(res => res.json());
    if (username) {
      return true;
    } else {
      return false;
    }
  }
  modeFormat(int) {
    if (int == 0) return "standard";
    if (int == 1) return "taiko";
    if (int == 2) return "catch";
    if (int == 3) return "mania";
  }
  commatize(number, maximumFractionDigits = 2) {
    return Number(number || "").toLocaleString("en-US", {
      maximumFractionDigits
    });
  }
  joinArrayAndLimit(array = [], limit = 1000, connector = '\n') {
    return array.reduce((a, c, i, x) => a.text.length + String(c).length > limit
      ? { text: a.text, excess: a.excess + 1 }
      : { text: a.text + (!!i ? connector : '') + String(c), excess: a.excess }
      , { text: '', excess: 0 });
  };
  clean(text) {
    return String(text).replace(/`/g, `\`${String.fromCharCode(8203)}`).replace(/@/g, `@${String.fromCharCode(8203)}`)
  };
  textTruncate(str = '', length = 100, end = '...') {
    return String(str).substring(0, length - end.length) + (str.length > length ? end : '');
  };
  truncate(...options) {
    return this.textTruncate(...options);
  };
  isProfane(str) {
    // Very, very, very long regex
    const regex = /\b(4r5e|5h1t|5hit|a55|anal|anus|ar5e|arrse|arse|ass|ass-fucker|asses|assfucker|assfukka|asshole|assholes|asswhole|a_s_s|b!tch|b00bs|b17ch|b1tch|ballbag|balls|ballsack|bastard|beastial|beastiality|bellend|bestial|bestiality|bi\+ch|biatch|bitch|bitcher|bitchers|bitches|bitchin|bitching|bloody|blow job|blowjob|blowjobs|boiolas|bollock|bollok|boner|boob|boobs|booobs|boooobs|booooobs|booooooobs|breasts|buceta|bugger|bum|bunny fucker|butt|butthole|buttmuch|buttplug|c0ck|c0cksucker|carpet muncher|cawk|chink|cipa|cl1t|clit|clitoris|clits|cnut|cock|cock-sucker|cockface|cockhead|cockmunch|cockmuncher|cocks|cocksuck|cocksucked|cocksucker|cocksucking|cocksucks|cocksuka|cocksukka|cok|cokmuncher|coksucka|coon|cox|crap|cum|cummer|cumming|cums|cumshot|cunilingus|cunillingus|cunnilingus|cunt|cuntlick|cuntlicker|cuntlicking|cunts|cyalis|cyberfuc|cyberfuck|cyberfucked|cyberfucker|cyberfuckers|cyberfucking|d1ck|damn|dick|dickhead|dildo|dildos|dink|dinks|dirsa|dlck|dog-fucker|doggin|dogging|donkeyribber|doosh|duche|dyke|ejaculate|ejaculated|ejaculates|ejaculating|ejaculatings|ejaculation|ejakulate|f u c k|f u c k e r|f4nny|fag|fagging|faggitt|faggot|faggs|fagot|fagots|fags|fanny|fannyflaps|fannyfucker|fanyy|fatass|fcuk|fcuker|fcuking|feck|fecker|felching|fellate|fellatio|fingerfuck|fingerfucked|fingerfucker|fingerfuckers|fingerfucking|fingerfucks|fistfuck|fistfucked|fistfucker|fistfuckers|fistfucking|fistfuckings|fistfucks|flange|fook|fooker|fuck|fucka|fucked|fucker|fuckers|fuckhead|fuckheads|fuckin|fucking|fuckings|fuckingshitmotherfucker|fuckme|fucks|fuckwhit|fuckwit|fudge packer|fudgepacker|fuk|fuker|fukker|fukkin|fuks|fukwhit|fukwit|fux|fux0r|f_u_c_k|gangbang|gangbanged|gangbangs|gaylord|gaysex|goatse|God|god-dam|god-damned|goddamn|goddamned|hardcoresex|hell|heshe|hoar|hoare|hoer|homo|hore|horniest|horny|hotsex|jack-off|jackoff|jap|jerk-off|jism|jiz|jizm|jizz|kawk|knob|knobead|knobed|knobend|knobhead|knobjocky|knobjokey|kock|kondum|kondums|kum|kummer|kumming|kums|kunilingus|l3i\+ch|l3itch|labia|lust|lusting|m0f0|m0fo|m45terbate|ma5terb8|ma5terbate|masochist|master-bate|masterb8|masterbat*|masterbat3|masterbate|masterbation|masterbations|masturbate|mo-fo|mof0|mofo|mothafuck|mothafucka|mothafuckas|mothafuckaz|mothafucked|mothafucker|mothafuckers|mothafuckin|mothafucking|mothafuckings|mothafucks|mother fucker|motherfuck|motherfucked|motherfucker|motherfuckers|motherfuckin|motherfucking|motherfuckings|motherfuckka|motherfucks|muff|mutha|muthafecker|muthafuckker|muther|mutherfucker|n1gga|n1gger|nazi|nigg3r|nigg4h|nigga|niggah|niggas|niggaz|nigger|niggers|nob|nob jokey|nobhead|nobjocky|nobjokey|numbnuts|nutsack|orgasim|orgasims|orgasm|orgasms|p0rn|pawn|pecker|penis|penisfucker|phonesex|phuck|phuk|phuked|phuking|phukked|phukking|phuks|phuq|pigfucker|pimpis|piss|pissed|pisser|pissers|pisses|pissflaps|pissin|pissing|pissoff|poop|porn|porno|pornography|pornos|prick|pricks|pron|pube|pusse|pussi|pussies|pussy|pussys|rectum|retard|rimjaw|rimming|s hit|s.o.b.|sadist|schlong|screwing|scroat|scrote|scrotum|semen|sex|sh!\+|sh!t|sh1t|shag|shagger|shaggin|shagging|shemale|shi\+|shit|shitdick|shite|shited|shitey|shitfuck|shitfull|shithead|shiting|shitings|shits|shitted|shitter|shitters|shitting|shittings|shitty|skank|slut|sluts|smegma|smut|snatch|son-of-a-bitch|spac|spunk|s_h_i_t|t1tt1e5|t1tties|teets|teez|testical|testicle|tit|titfuck|tits|titt|tittie5|tittiefucker|titties|tittyfuck|tittywank|titwank|tosser|turd|tw4t|twat|twathead|twatty|twunt|twunter|v14gra|v1gra|vagina|viagra|vulva|w00se|wang|wank|wanker|wanky|whoar|whore|willies|willy|xrated|xxx)\b/gi;
    return regex.test(str)
  }
  toProperCase(str) {
    return str.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  probability(int) {
    const n = int / 100
    return !!n && Math.random() <= n;
  };
  graphqlCheck(query, variables) {
    return _fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ query, variables })
    })
      .then(res => res.json())
      .catch(err => err);
  }
  textRequire(name, require) {
    return fs.readFileSync(require.resolve(name)).toString();
  };
  joinArray(array = []) {
    return list.format(array.map(x => String(`\`${x}\``)));
  };
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    };
  };
  ordinalize(n = 0) {
    return Number(n) + [, 'st', 'nd', 'rd'][n / 10 % 10 ^ 1 && n % 10] || Number(n) + 'th';
  };
  // Thanks TehNut for these getMediaID and getTitle TypeScript implementation!
  async getMediaId(input) {
    // See if the input is actually the ID
    const output = parseInt(input);
    if (output) return output;
    // If that fails
    // First just get 2 normal URL regex for AniList and MAL
    const alIdRegex = /anilist\.co\/anime\/(.\d*)/;
    const malIdRegex = /myanimelist\.net\/anime\/(.\d*)/;
    // If it matches, parse it and return that matching result from AL
    let match = alIdRegex.exec(input);
    if (match) return parseInt(match[1]);
    // If AL fails, try once more with MAL
    match = malIdRegex.exec(input);
    // If there's nothing then just return null
    if (!match) return null;
    // Else just fetch the AL equivalent
    const res = await this.client.ani.fetch("query($malId: Int) { Media(idMal: $malId) { id } }", { malId: match[1] });
    if (res.errors) {
      this.error(JSON.stringify(res.errors));
      return;
    }
    return res.data.Media.id;
  }
  getTitle(title, wanted) {
    switch (wanted) {
      case "NATIVE": return title.native;
      case "ROMAJI": return title.romaji;
      case "ENGLISH": return title.english || title.romaji;
      default: return title.romaji;
    }
  }
  // This deletes a value from one array
  delete(array, key) {
    const index = array.indexOf(key);
    if (index > -1) {
      array.splice(index, 1); // Remove one item only
    };
    return array;
  }
  // Thanks EternalGaius for these 2 pieces of util functions!
  page(map, limit, joinStyle = '\n\n') {
    let pages = Math.ceil(map.length / limit) || 1;
    const results = [];
    for (let index = 0; index < pages; index++) {
      const index2 = index + 1;
      const start = (index2 * limit) - limit
      const end = index2 * limit;
      results.push(map.slice(start, end).join(joinStyle))
    }
    let page = 1;
    return { page, pages, results }
  }
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', "PB", 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
  }
}
