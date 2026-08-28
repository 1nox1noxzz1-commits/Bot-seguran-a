const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');

module.exports = {
  customId: 'acoes_entrada_canal_select',

  async execute(interaction) {
    const channelId = interaction.values[0];
    database.updateGuild(interaction.guild.id, { entrada: { channel: channelId } });

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setDescription(`✅ Canal de entrada definido para <#${channelId}>.\nNovos membros serão mencionados neste canal e a mensagem será apagada após 5 segundos.`)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('acoes_entrada')
        .setLabel('Voltar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(emojis.voltar),
    );

    await interaction.update({ embeds: [embed], components: [row] });
  },
};
