const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');
const { validateKey } = require('../../utils/backup');

module.exports = {
  customIdPrefix: 'modal_backup_remover_',

  async execute(interaction) {
    const backupId = interaction.customId.replace('modal_backup_remover_', '');
    const chave    = interaction.fields.getTextInputValue('chave');

    if (!validateKey(backupId, chave)) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(0xFF4444).setDescription('❌ Chave inválida. A remoção foi cancelada.')],
        ephemeral: true,
      });
    }

    const deleted = database.deleteBackup(interaction.guild.id, backupId);

    const embed = new EmbedBuilder()
      .setColor(deleted ? 0x57F287 : 0xFF4444)
      .setDescription(deleted ? '✅ Backup removido com sucesso.' : '❌ Backup não encontrado.')
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('painel_backup')
        .setLabel('Voltar')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji(emojis.voltar),
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },
};
