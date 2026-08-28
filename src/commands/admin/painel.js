const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
} = require('discord.js');
const emojis = require('../../utils/emojis');

const IS_COMPONENTS_V2 = 1 << 15;

function buildMainComponents() {
  const container = new ContainerBuilder()
    .setAccentColor(0x2b2d31)
    .addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder()
          .setURL('https://i.imgur.com/ljSEMtx.png')
      )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        '### 👋 Bem-vindo ao Painel de Segurança!\n' +
        'Aqui podes gerir todas as proteções do teu servidor.'
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        '> 🛡️ **Proteção** — Configura os sistemas de defesa\n' +
        '> 🤖 **IA** — Moderação inteligente automática\n' +
        '> 🗄️ **Backup** — Guarda e restaura o servidor\n' +
        '> ⚙️ **Ações Automáticas** — Respostas a eventos'
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        '-# Seleciona uma categoria abaixo para começar.'
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('painel_backup')
          .setLabel('Backup')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(emojis.db),
        new ButtonBuilder()
          .setCustomId('painel_ia')
          .setLabel('IA')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(emojis.ia),
        new ButtonBuilder()
          .setCustomId('painel_protecao')
          .setLabel('Proteção')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(emojis.protect),
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('painel_acoes')
          .setLabel('Ações Automáticas')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(emojis.aut),
      )
    );

  return [container];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Painel de controlo do bot Anti-Raid')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: '❌ Apenas o dono do bot pode abrir o painel.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.reply({
      components: buildMainComponents(),
      flags: MessageFlags.Ephemeral | IS_COMPONENTS_V2,
    });
  },

  buildMainComponents, // ✅ exportado para reutilizar nos handlers de botões
};