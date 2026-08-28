const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');
const { restoreBackup } = require('../../utils/backup');
const { pendingRestore } = require('../selects/backupRestaurarSelect');

module.exports = {
  customId: 'modal_backup_restaurar',

  async execute(interaction, client) {
    const confirmacao = interaction.fields.getTextInputValue('confirmacao').trim();

    if (confirmacao !== 'CONFIRMAR') {
      return interaction.reply({
        content: '❌ Confirmação incorreta. Escreve exatamente `CONFIRMAR`.',
        flags: (1 << 6),
      });
    }

    const backupId = pendingRestore.get(interaction.guild.id);
    if (!backupId) {
      return interaction.reply({
        content: '❌ Sessão expirada. Começa o processo novamente.',
        flags: (1 << 6),
      });
    }

    const backup = database.getBackup(interaction.guild.id, backupId);
    if (!backup) {
      return interaction.reply({
        content: '❌ Backup não encontrado.',
        flags: (1 << 6),
      });
    }

    await interaction.reply({
      content: '⏳ A restaurar o servidor... Isto pode demorar alguns segundos.',
      flags: (1 << 6),
    });

    try {
      await restoreBackup(interaction.guild, backup);
      pendingRestore.delete(interaction.guild.id);
    } catch (err) {
      console.error('[Restauro] Erro:', err);
      await interaction.followUp({
        content: '❌ Ocorreu um erro durante o restauro.',
        flags: (1 << 6),
      });
    }
  },
};