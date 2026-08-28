const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');
const { createBackup } = require('../../utils/backup');

const IS_COMPONENTS_V2 = 1 << 15;

module.exports = {
  customIdPrefix: 'backup_',

  async execute(interaction, client) {
    const action = interaction.customId.replace('backup_', '');
    switch (action) {
      case 'fazer':   return doBackup(interaction, client);
      case 'listar':  return listBackups(interaction);
      case 'remover': return showRemoveMenu(interaction);
    }
  },
};

function makeContainer(accentColor = 0x2b2d31) {
  return new ContainerBuilder().setAccentColor(accentColor);
}

function sep() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

function voltarBackup() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('painel_backup').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
  );
}

async function doBackup(interaction, client) {
  await interaction.deferUpdate();

  const { backupId, key, backupData } = await createBackup(interaction.guild);

  // Enviar chave por DM ao dono
  const owner = await client.users.fetch(process.env.OWNER_ID).catch(() => null);
  if (owner) {
    const dmContainer = makeContainer(0x57F287)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `### 🔑 Chave de Segurança do Backup\n` +
          `**Backup ID:** \`${backupId}\`\n` +
          `**Chave:** \`${key}\`\n\n` +
          `⚠️ Guarda esta chave. Será necessária para remover o backup.`
        )
      );
    await owner.send({ components: [dmContainer], flags: IS_COMPONENTS_V2 }).catch(() => {});
  }

  const container = makeContainer(0x57F287)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ✅ Backup Criado com Sucesso!\n` +
        `**Nome:** ${backupData.name}\n` +
        `**Canais:** ${backupData.channels.length} | **Cargos:** ${backupData.roles.length}\n` +
        `🔑 **Chave:** Enviada por DM ao dono do bot.`
      )
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(voltarBackup());

  await interaction.editReply({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function listBackups(interaction) {
  const backups = database.listBackups(interaction.guild.id);

  let content;
  if (!backups.length) {
    content = `### ${emojis.diretorio} Backups Existentes\nNenhum backup encontrado.`;
  } else {
    const lista = backups.map((b, i) =>
      `**${i + 1}.** \`${b.name}\`\n📅 ${new Date(b.createdAt).toLocaleString('pt-PT')}`
    ).join('\n\n');
    content = `### ${emojis.diretorio} Backups Existentes\n${lista}`;
  }

  const container = makeContainer(0x5865F2)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
    .addSeparatorComponents(sep())
    .addActionRowComponents(voltarBackup());

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function showRemoveMenu(interaction) {
  const backups = database.listBackups(interaction.guild.id);

  if (!backups.length) {
    const container = makeContainer(0xFF4444)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('❌ Nenhum backup para remover.')
      )
      .addActionRowComponents(voltarBackup());

    return interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
  }

  const select = new StringSelectMenuBuilder()
    .setCustomId('backup_remover_select')
    .setPlaceholder('Seleciona o backup a remover...')
    .addOptions(
      backups.slice(0, 25).map(b =>
        new StringSelectMenuOptionBuilder()
          .setLabel(b.name)
          .setValue(b.id)
          .setDescription(`Criado em: ${new Date(b.createdAt).toLocaleDateString('pt-PT')}`)
          .setEmoji('🗑️')
      )
    );

  const container = makeContainer(0xFF4444)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${emojis.apagar} Remover Backup\nSeleciona o backup a eliminar. Será pedida a chave de segurança.`
      )
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(select))
    .addActionRowComponents(voltarBackup());

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}
