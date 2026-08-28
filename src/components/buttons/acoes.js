const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  EmbedBuilder,
  MessageFlags,
} = require('discord.js');
const emojis    = require('../../utils/emojis');
const database  = require('../../utils/database');
const scheduler = require('../../utils/scheduler');

const IS_COMPONENTS_V2 = 1 << 15;

module.exports = {
  customIdPrefix: 'acoes_',

  async execute(interaction, client) {
    const action = interaction.customId.replace('acoes_', '');
    switch (action) {
      case 'mensagens':         return showMensagensMenu(interaction);
      case 'entrada':           return showEntradaMenu(interaction);
      case 'msg_definir':       return showMsgModal(interaction);
      case 'msg_visualizar':    return previewMsg(interaction);
      case 'msg_testar':        return testMsg(interaction, client);
      case 'msg_horas':         return showHorasModal(interaction);
      case 'msg_start':         return toggleMsgScheduler(interaction, client, true);
      case 'msg_stop':          return toggleMsgScheduler(interaction, client, false);
      case 'msg_canal':         return showMsgCanalSelect(interaction);
      case 'entrada_ativar':    return toggleEntrada(interaction, true);
      case 'entrada_desativar': return toggleEntrada(interaction, false);
      case 'entrada_canal':     return showEntradaCanalSelect(interaction);
    }
  },
};

function makeContainer(accentColor = 0x2b2d31) {
  return new ContainerBuilder().setAccentColor(accentColor);
}

function sep() {
  return new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
}

// ── Mensagens Automáticas ─────────────────────────────────────────
async function showMensagensMenu(interaction) {
  const config = database.getGuild(interaction.guild.id);
  const am     = config.autoMessages;

  const container = makeContainer(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${emojis.mensagem} Mensagens Automáticas\n` +
        `**Estado:** ${am.enabled ? '🟢 Ativa' : '🔴 Inativa'} | ` +
        `**Canal:** ${am.channel ? `<#${am.channel}>` : 'Não definido'} | ` +
        `**Intervalo:** ${am.cronExpression || 'Não definido'}\n` +
        `**Mensagem:** ${am.message ? am.message.slice(0, 100) + '...' : 'Não definida'}`
      )
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('acoes_msg_definir').setLabel('Definir Mensagem').setStyle(ButtonStyle.Primary).setEmoji(emojis.mensagem),
        new ButtonBuilder().setCustomId('acoes_msg_visualizar').setLabel('Visualizar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.visible),
        new ButtonBuilder().setCustomId('acoes_msg_testar').setLabel('Testar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.wand),
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('acoes_msg_horas').setLabel('Definir Intervalo').setStyle(ButtonStyle.Secondary).setEmoji(emojis.clock),
        new ButtonBuilder().setCustomId('acoes_msg_canal').setLabel('Definir Canal').setStyle(ButtonStyle.Secondary).setEmoji(emojis.canal),
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('acoes_msg_start').setLabel('Iniciar').setStyle(ButtonStyle.Success).setEmoji(emojis.positivo),
        new ButtonBuilder().setCustomId('acoes_msg_stop').setLabel('Parar').setStyle(ButtonStyle.Danger).setEmoji(emojis.negativo),
        new ButtonBuilder().setCustomId('painel_acoes').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function showMsgModal(interaction) {
  const config = database.getGuild(interaction.guild.id);

  const modal = new ModalBuilder()
    .setCustomId('modal_acoes_mensagem')
    .setTitle('✉️ Definir Mensagem Automática');

  const tipoInput = new TextInputBuilder()
    .setCustomId('tipo')
    .setLabel('Tipo: "content" ou "embed"')
    .setStyle(TextInputStyle.Short)
    .setValue(config.autoMessages.type || 'content')
    .setRequired(true);

  const msgInput = new TextInputBuilder()
    .setCustomId('mensagem')
    .setLabel('Conteúdo da mensagem')
    .setStyle(TextInputStyle.Paragraph)
    .setValue(config.autoMessages.message || '')
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(tipoInput),
    new ActionRowBuilder().addComponents(msgInput),
  );

  await interaction.showModal(modal);
}

async function previewMsg(interaction) {
  const config = database.getGuild(interaction.guild.id);
  const am     = config.autoMessages;

  if (!am.message) {
    return interaction.reply({ content: '❌ Nenhuma mensagem definida.', flags: MessageFlags.Ephemeral });
  }

  if (am.type === 'embed') {
    // Preview do embed usa EmbedBuilder normal (é uma reply separada, não um update)
    const embed = new EmbedBuilder().setDescription(am.message).setColor(0x5865F2).setTimestamp();
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  } else {
    await interaction.reply({ content: am.message, flags: MessageFlags.Ephemeral });
  }
}

async function testMsg(interaction, client) {
  const config = database.getGuild(interaction.guild.id);
  const am     = config.autoMessages;

  if (!am.message) return interaction.reply({ content: '❌ Nenhuma mensagem definida.', flags: MessageFlags.Ephemeral });
  if (!am.channel) return interaction.reply({ content: '❌ Canal não definido.', flags: MessageFlags.Ephemeral });

  const channel = await client.channels.fetch(am.channel).catch(() => null);
  if (!channel)   return interaction.reply({ content: '❌ Canal não encontrado.', flags: MessageFlags.Ephemeral });

  if (am.type === 'embed') {
    const embed = new EmbedBuilder().setDescription(am.message).setColor(0x5865F2).setTimestamp();
    await channel.send({ embeds: [embed] });
  } else {
    await channel.send({ content: am.message });
  }

  await interaction.reply({ content: `✅ Mensagem de teste enviada para <#${am.channel}>.`, flags: MessageFlags.Ephemeral });
}

async function showHorasModal(interaction) {
  const config = database.getGuild(interaction.guild.id);

  const modal = new ModalBuilder()
    .setCustomId('modal_acoes_horas')
    .setTitle('⏰ Definir Intervalo (Cron)');

  const input = new TextInputBuilder()
    .setCustomId('cron')
    .setLabel('Cron (ex: "0 * * * *" = a cada hora)')
    .setStyle(TextInputStyle.Short)
    .setValue(config.autoMessages.cronExpression || '0 * * * *')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

async function showMsgCanalSelect(interaction) {
  const select = new ChannelSelectMenuBuilder()
    .setCustomId('acoes_msg_canal_select')
    .setPlaceholder('Seleciona um canal de texto...')
    .setChannelTypes(ChannelType.GuildText);

  const container = makeContainer(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${emojis.canal} Canal das Mensagens Automáticas\nSeleciona o canal onde serão enviadas as mensagens automáticas.`
      )
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(select))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('acoes_mensagens').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function toggleMsgScheduler(interaction, client, start) {
  const config = database.getGuild(interaction.guild.id);

  if (start) {
    if (!config.autoMessages.message) return interaction.reply({ content: '❌ Define uma mensagem primeiro.', flags: MessageFlags.Ephemeral });
    if (!config.autoMessages.channel) return interaction.reply({ content: '❌ Define um canal primeiro.', flags: MessageFlags.Ephemeral });
    database.updateGuild(interaction.guild.id, { autoMessages: { enabled: true } });
    scheduler.startScheduler(client, interaction.guild.id, { ...config.autoMessages, enabled: true });
  } else {
    database.updateGuild(interaction.guild.id, { autoMessages: { enabled: false } });
    scheduler.stopScheduler(interaction.guild.id);
  }

  const container = makeContainer(start ? 0x57F287 : 0xFF4444)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        start ? '✅ Mensagens automáticas **iniciadas**.' : '❌ Mensagens automáticas **paradas**.'
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('acoes_mensagens').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

// ── Entrada ───────────────────────────────────────────────────────
async function showEntradaMenu(interaction) {
  const config  = database.getGuild(interaction.guild.id);
  const entrada = config.entrada;

  const container = makeContainer(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${emojis.user} Mensagem de Entrada\n` +
        `Configura a mensagem de boas-vindas para novos membros.\nO bot marca o novo membro e apaga a mensagem após 5 segundos.\n\n` +
        `**Estado:** ${entrada.enabled ? '🟢 Ativa' : '🔴 Inativa'} | ` +
        `**Canal:** ${entrada.channel ? `<#${entrada.channel}>` : 'Não definido'}`
      )
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('acoes_entrada_ativar').setLabel('Ativar').setStyle(ButtonStyle.Success).setEmoji(emojis.positivo).setDisabled(entrada.enabled),
        new ButtonBuilder().setCustomId('acoes_entrada_desativar').setLabel('Desativar').setStyle(ButtonStyle.Danger).setEmoji(emojis.negativo).setDisabled(!entrada.enabled),
        new ButtonBuilder().setCustomId('acoes_entrada_canal').setLabel('Definir Canal').setStyle(ButtonStyle.Secondary).setEmoji(emojis.canal),
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('painel_acoes').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function toggleEntrada(interaction, enabled) {
  database.updateGuild(interaction.guild.id, { entrada: { enabled } });

  const container = makeContainer(enabled ? 0x57F287 : 0xFF4444)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        enabled ? '✅ Mensagem de entrada **ativada**.' : '❌ Mensagem de entrada **desativada**.'
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('acoes_entrada').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}

async function showEntradaCanalSelect(interaction) {
  const select = new ChannelSelectMenuBuilder()
    .setCustomId('acoes_entrada_canal_select')
    .setPlaceholder('Seleciona um canal de texto...')
    .setChannelTypes(ChannelType.GuildText);

  const container = makeContainer(0x5865F2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${emojis.canal} Canal de Entrada\nSeleciona o canal onde os novos membros serão mencionados.`
      )
    )
    .addSeparatorComponents(sep())
    .addActionRowComponents(new ActionRowBuilder().addComponents(select))
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('acoes_entrada').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji(emojis.voltar),
      )
    );

  await interaction.update({ components: [container], flags: IS_COMPONENTS_V2 });
}
