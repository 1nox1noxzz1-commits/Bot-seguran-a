const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const database = require('../../utils/database');
const { restoreBackup } = require('../../utils/backup');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('usar_backup')
    .setDescription('Restaura um backup do servidor')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('ID do backup (obtido ao listar backups)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('chave')
        .setDescription('Chave de segurança enviada por DM ao fazer o backup')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: '❌ Apenas o dono do bot pode restaurar backups.',
        flags: (1 << 6),
      });
    }

    const backupId = interaction.options.getString('id');
    const chave    = interaction.options.getString('chave');

    const { validateKey } = require('../../utils/backup');
    if (!validateKey(backupId, chave)) {
      return interaction.reply({
        content: '❌ Chave inválida ou expirada.',
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
      
      // Envia confirmação por DM pois o canal foi apagado
      const owner = await interaction.client.users.fetch(process.env.OWNER_ID).catch(() => null);
      if (owner) {
        await owner.send('✅ Servidor restaurado com sucesso!').catch(() => {});
      }
    } catch (err) {
      console.error('[Restauro] Erro:', err);
      const owner = await interaction.client.users.fetch(process.env.OWNER_ID).catch(() => null);
      if (owner) {
        await owner.send('❌ Ocorreu um erro durante o restauro.').catch(() => {});
      }
    }
  },
};