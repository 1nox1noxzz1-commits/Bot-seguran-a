const { PermissionFlagsBits } = require('discord.js');

async function checkOwner(interaction) {
  const ownerId = process.env.OWNER_ID;
  if (interaction.user.id !== ownerId) {
    await interaction.reply({
      content: '❌ Apenas o dono do bot pode usar este painel.',
      ephemeral: true,
    });
    return false;
  }
  return true;
}

async function checkAdmin(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: '❌ Precisas de ter permissões de Administrador.',
      ephemeral: true,
    });
    return false;
  }
  return true;
}

module.exports = { checkOwner, checkAdmin };
