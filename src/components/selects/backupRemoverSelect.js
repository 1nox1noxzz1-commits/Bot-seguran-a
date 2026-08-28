const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'backup_remover_select',

  async execute(interaction) {
    const backupId = interaction.values[0];

    const modal = new ModalBuilder()
      .setCustomId(`modal_backup_remover_${backupId}`)
      .setTitle('🔑 Confirmar Remoção');

    const keyInput = new TextInputBuilder()
      .setCustomId('chave')
      .setLabel('Introduz a chave de segurança')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(64);

    modal.addComponents(new ActionRowBuilder().addComponents(keyInput));
    await interaction.showModal(modal);
  },
};
