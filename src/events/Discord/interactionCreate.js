module.exports = async (client, interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (interaction.user.bot) return;
    if (!interaction.member && interaction.isCommand())
      return interaction.reply({
        content: "You must be in a server to use commands."
      });

    // Implement something like an XP system here
    try {
      const cooldown = client.util.checkCooldown(interaction, command)
      if (!cooldown.accept) return interaction.reply({ content: `Baka, I'm not a spamming machine. You'll be able to do this again in **${cooldown.timeLeft}**.`, ephemeral: true })
      command.run(client, interaction);
    } catch (e) {
      console.log(e);
      return interaction.reply({
        content: `An error has occurred.\n\n**\`${e.message}\`**`
      });
    }
  }
};
