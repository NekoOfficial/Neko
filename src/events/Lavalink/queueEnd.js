const responses = [
  "Oh - your queue ended. Gonna leave then.",
  "I left for whatever reason you know.",
  "Your queue ended - time to go. Get in again some time!",
  "Sudden drop - queue ends. I'm gonna go then.",
  "They told me your order has been completed. Off I go to a better place then.",
  "I've been told to get the bawa out after your music is done playing, so yeah."
]

module.exports = async (client, player) => {
  const channel = client.channels.cache.get(player.textChannel);
  const pick = Math.floor(Math.random() * 6); // Random the picks
  await channel.send({
    content: responses[pick]
  });
  player.destroy();
};
