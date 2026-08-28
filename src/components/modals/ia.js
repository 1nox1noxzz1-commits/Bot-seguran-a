const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');

module.exports = {
  customIdPrefix: 'modal_ia_',

  async execute(interaction) {
    const tipo  = interaction.customId.replace('modal_ia_', '');
    const valor = interaction.fields.getTextInputValue('valor');

    const updates = tipo === 'api' ? { ia: { apiKey: valor } } : { ia: { prompt: valor } };
    database.updateGuild(interaction.guild.id, updates);

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setDescription(`✅ ${tipo === 'api' ? 'API Key do Grok' : 'Prompt da IA'} atualizado com sucesso.`)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('painel_ia').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
