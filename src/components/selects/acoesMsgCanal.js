const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');

module.exports = {
  customId: 'acoes_msg_canal_select',

  async execute(interaction) {
    const channelId = interaction.values[0];
    database.updateGuild(interaction.guild.id, { autoMessages: { channel: channelId } });

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setDescription(`✅ Canal das mensagens automáticas definido para <#${channelId}>.`)
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('acoes_mensagens')
        .setLabel('Voltar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(emojis.voltar),
    );

    await interaction.update({ embeds: [embed], components: [row] });
  },
};
