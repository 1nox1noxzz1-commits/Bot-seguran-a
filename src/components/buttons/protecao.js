const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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

const LABELS = {
  addBot:        'Adição de Bots',
  webhook:       'Criação de Webhooks',
  channelCreate: 'Criação de Canais',
  massBan:       'Banimentos em Massa',
  massKick:      'Kicks em Massa',
};

module.exports = {
  customIdPrefix: 'prot_',

  async execute(interaction) {
    const [, action, ...rest] = interaction.customId.split('_');
    const tipo = rest.join('_');

    if (action === 'toggle') return toggleProtecao(interaction, tipo);
    if (action === 'logs')   return showLogsSelect(interaction, tipo);
  },
};

function makeContainer(accentColor = 0x2b2d31) {
  return new ContainerBuilder().setAccentColor(accentColor);
}

function sep() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

async function toggleProtecao(interaction, tipo) {
  const config  = database.getGuild(interaction.guild.id);
  const current = config.protection[tipo]?.enabled ?? false;
  const enabled = !current;

  database.updateGuild(interaction.guild.id, { protection: { [tipo]: { enabled } } });

  const label = LABELS[tipo] || tipo;
  const container = makeContainer(enabled ? 0x57F287 : 0xFF4444)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${enabled ? '✅' : '❌'} Proteção **${label}** ${enabled ? 'ativada' : 'desativada'}.`
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('painel_protecao').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function showLogsSelect(interaction, tipo) {
  const label = LABELS[tipo] || tipo;

  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId(`prot_logs_channel_select_${tipo}`)
    .setPlaceholder('Seleciona um canal de texto...')
    .setChannelTypes(ChannelType.GuildText);

  const container = makeContainer(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${emojis.canal} Canal de Logs — ${label}\nSeleciona o canal de texto para os logs desta proteção.`
      )
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(channelSelect))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('painel_protecao').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}
