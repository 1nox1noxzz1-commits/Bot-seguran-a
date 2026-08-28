const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const pendingRestore = new Map();

module.exports = {
  customId: 'backup_restaurar_select',

  async execute(interaction, client) {
    const backupId = interaction.values[0];
    pendingRestore.set(interaction.guild.id, backupId);

    const modal = new ModalBuilder()
      .setCustomId('modal_backup_restaurar')
      .setTitle('⚠️ Confirmar Restauro');

    const input = new TextInputBuilder()
      .setCustomId('confirmacao')
      .setLabel('Escreve CONFIRMAR para restaurar')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
};

module.exports.pendingRestore = pendingRestore;