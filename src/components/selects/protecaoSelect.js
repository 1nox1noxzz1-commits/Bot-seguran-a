const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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
  customId: 'protecao_select',

  async execute(interaction) {
    const tipo   = interaction.values[0];
    const config = database.getGuild(interaction.guild.id);
    const prot   = config.protection[tipo];
    const label  = LABELS[tipo] || tipo;

    const estadoTexto   = prot.enabled ? '🟢 Ativa' : '🔴 Inativa';
    const logCanalTexto = prot.logChannel ? `<#${prot.logChannel}>` : 'Não definido';

    const container = new ContainerBuilder()
      .setAccentColor(0x5865F2)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `### ${emojis.protect} Proteção — ${label}\n` +
          `**Estado:** ${estadoTexto}\n` +
          `**Canal de Logs:** ${logCanalTexto}`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`prot_toggle_${tipo}`)
            .setLabel(prot.enabled ? 'Desativar' : 'Ativar')
            .setStyle(prot.enabled ? ButtonStyle.Danger : ButtonStyle.Success)
            .setEmoji(prot.enabled ? emojis.negativo : emojis.positivo),
          new ButtonBuilder()
            .setCustomId(`prot_logs_${tipo}`)
            .setLabel('Canal de Logs')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.canal),
        )
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('painel_protecao')
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.voltar),
        )
      );

    await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
  },
};