const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');

// Seleção de modelo
module.exports = {
  customId: 'ia_modelo_select',

  async execute(interaction) {
    const model = interaction.values[0];
    database.updateGuild(interaction.guild.id, { ia: { model } });

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setDescription(`✅ Modelo alterado para \`${model}\`.`)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('painel_ia').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
    );

    await interaction.update({ embeds: [embed], components: [row] });
  },
};
