const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require('discord.js');
const emojis   = require('../../utils/emojis');
const database = require('../../utils/database');

const IS_COMPONENTS_V2 = 1 << 15;

module.exports = {
  customIdPrefix: 'ia_',

  async execute(interaction, client) {
    const action = interaction.customId.replace('ia_', '');
    switch (action) {
      case 'api':    return showModalIA(interaction, 'api');
      case 'prompt': return showModalIA(interaction, 'prompt');
      case 'modelo': return showModeloSelect(interaction);
      case 'logs':   return showLogsSelect(interaction);
      case 'toggle': return toggleIA(interaction);
    }
  },
};

function makeContainer(accentColor = 0x2b2d31) {
  return new ContainerBuilder().setAccentColor(accentColor);
}

function sep() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

async function showModalIA(interaction, tipo) {
  const config = database.getGuild(interaction.guild.id);

  const modal = new ModalBuilder()
    .setCustomId(`modal_ia_${tipo}`)
    .setTitle(tipo === 'api' ? '🔑 API Key do Grok' : '📝 Prompt da IA');

  const input = new TextInputBuilder()
    .setCustomId('valor')
    .setLabel(tipo === 'api' ? 'Introduz a API Key do Grok' : 'Escreve o prompt da IA')
    .setStyle(tipo === 'api' ? TextInputStyle.Short : TextInputStyle.Paragraph)
    .setRequired(true)
    .setValue(tipo === 'api' ? (config.ia.apiKey || '') : (config.ia.prompt || ''));

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

async function showModeloSelect(interaction) {
  const config = database.getGuild(interaction.guild.id);

  const select = new StringSelectMenuBuilder()
    .setCustomId('ia_modelo_select')
    .setPlaceholder('Escolhe o modelo...')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('grok-beta').setValue('grok-beta').setDescription('Modelo padrão do Grok'),
      new StringSelectMenuOptionBuilder().setLabel('grok-vision-beta').setValue('grok-vision-beta').setDescription('Suporta análise de imagens'),
      new StringSelectMenuOptionBuilder().setLabel('grok-2').setValue('grok-2').setDescription('Grok 2 (mais recente)'),
      new StringSelectMenuOptionBuilder().setLabel('grok-2-vision').setValue('grok-2-vision').setDescription('Grok 2 com visão'),
    );

  const container = makeContainer(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${emojis.wand} Modelo da IA\nModelo atual: \`${config.ia.model || 'grok-beta'}\``
      )
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(select))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('painel_ia').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function showLogsSelect(interaction) {
  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId('ia_logs_channel_select')
    .setPlaceholder('Seleciona um canal de texto...')
    .setChannelTypes(ChannelType.GuildText);

  const container = makeContainer(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${emojis.canal} Canal de Logs da IA\nSeleciona o canal onde serão registadas as mensagens e imagens apagadas pela IA.`
      )
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(channelSelect))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('painel_ia').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function toggleIA(interaction) {
  const config  = database.getGuild(interaction.guild.id);
  const enabled = !config.ia.enabled;
  database.updateGuild(interaction.guild.id, { ia: { enabled } });

  const container = makeContainer(enabled ? 0x57F287 : 0xFF4444)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        enabled ? '✅ IA **ativada** com sucesso.' : '❌ IA **desativada**.'
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('painel_ia').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}
