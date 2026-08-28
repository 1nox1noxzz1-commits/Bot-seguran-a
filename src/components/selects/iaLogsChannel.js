const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');

module.exports = {
  customId: 'ia_logs_channel_select',

  async execute(interaction) {
    const channelId = interaction.values[0];
    database.updateGuild(interaction.guild.id, { ia: { logChannel: channelId } });

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setDescription(`✅ Canal de logs da IA definido para <#${channelId}>.`)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('painel_ia').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
    );

    await interaction.update({ embeds: [embed], components: [row] });
  },
};
