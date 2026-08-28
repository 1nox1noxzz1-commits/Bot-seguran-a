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
const emojis = require('../../utils/emojis');
const { buildMainComponents } = require('../../commands/admin/painel');

const IS_COMPONENTS_V2 = 1 << 15;

module.exports = {
  customIdPrefix: 'painel_',

  async execute(interaction, client) {
    const action = interaction.customId.replace('painel_', '');
    switch (action) {
      case 'backup':   return showBackupMenu(interaction);
      case 'ia':       return showIAMenu(interaction);
      case 'protecao': return showProtecaoMenu(interaction);
      case 'acoes':    return showAcoesMenu(interaction);
      case 'main':     return interaction.update({ components: buildMainComponents(), flags: IS_COMPONENTS_V2 });
    }
  },
};

function makeContainer(accentColor = 0x2b2d31) {
  return new ContainerBuilder().setAccentColor(accentColor);
}

function sep() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

async function showBackupMenu(interaction) {
  const container = makeContainer()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### ${emojis.fmt(emojis.db)} Backup\nGere os backups do servidor.`)
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('backup_fazer').setLabel('Fazer Backup').setStyle(ButtonStyle.Success).setEmoji(emojis.mais2),
        new ButtonBuilder().setCustomId('backup_listar').setLabel('Listar Backups').setStyle(ButtonStyle.Primary).setEmoji(emojis.diretorio),
        new ButtonBuilder().setCustomId('backup_restaurar').setLabel('Restaurar Backup').setStyle(ButtonStyle.Primary).setEmoji(emojis.reload),
        new ButtonBuilder().setCustomId('backup_remover').setLabel('Remover Backup').setStyle(ButtonStyle.Danger).setEmoji(emojis.apagar),
        new ButtonBuilder().setCustomId('painel_main').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function showIAMenu(interaction) {
  const container = makeContainer()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### ${emojis.fmt(emojis.ia)} Inteligência Artificial\nConfigura o sistema de segurança baseado em IA.`)
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ia_api').setLabel('Definir API Grok').setStyle(ButtonStyle.Primary).setEmoji(emojis.prompt),
        new ButtonBuilder().setCustomId('ia_prompt').setLabel('Prompt').setStyle(ButtonStyle.Primary).setEmoji(emojis.prompt),
        new ButtonBuilder().setCustomId('ia_modelo').setLabel('Modelo da IA').setStyle(ButtonStyle.Secondary).setEmoji(emojis.wand),
        new ButtonBuilder().setCustomId('ia_logs').setLabel('Logs da IA').setStyle(ButtonStyle.Secondary).setEmoji(emojis.canal),
        new ButtonBuilder().setCustomId('painel_main').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function showProtecaoMenu(interaction) {
  const select = new StringSelectMenuBuilder()
    .setCustomId('protecao_select')
    .setPlaceholder('Escolhe uma proteção...')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Adição de Bots').setValue('addBot').setDescription('Pede confirmação ao dono ao adicionar bots').setEmoji('🤖'),
      new StringSelectMenuOptionBuilder().setLabel('Criação de Webhooks').setValue('webhook').setDescription('Pede confirmação ao criar webhooks').setEmoji('🪝'),
      new StringSelectMenuOptionBuilder().setLabel('Criação de Canais').setValue('channelCreate').setDescription('Pede confirmação ao criar canais').setEmoji('📁'),
      new StringSelectMenuOptionBuilder().setLabel('Banimentos em Massa').setValue('massBan').setDescription('Alerta ao dono se houver bans em massa').setEmoji('🔨'),
      new StringSelectMenuOptionBuilder().setLabel('Kicks em Massa').setValue('massKick').setDescription('Alerta ao dono se houver kicks em massa').setEmoji('👢'),
    );

  const container = makeContainer()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### ${emojis.fmt(emojis.protect)} Proteção\nSeleciona uma proteção para configurar.`)
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(select))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('painel_main').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function showAcoesMenu(interaction) {
  const container = makeContainer()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### ${emojis.fmt(emojis.aut)} Ações Automáticas\nEscolhe o tipo de ação automática a configurar.`)
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('acoes_mensagens').setLabel('Mensagens').setStyle(ButtonStyle.Primary).setEmoji(emojis.mensagem),
        new ButtonBuilder().setCustomId('acoes_entrada').setLabel('Entrada').setStyle(ButtonStyle.Primary).setEmoji(emojis.user),
        new ButtonBuilder().setCustomId('painel_main').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}
