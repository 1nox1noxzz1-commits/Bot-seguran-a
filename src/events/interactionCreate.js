module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    try {
      // ── Slash Commands ───────────────────────────────────────
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction, client);

      // ── Botões ───────────────────────────────────────────────
      } else if (interaction.isButton()) {
        const handler = [...client.buttonHandlers.values()].find(h => {
          if (h.customIdPrefix && interaction.customId.startsWith(h.customIdPrefix)) return true;
          if (h.customId && interaction.customId === h.customId) return true;
          return false;
        });
        if (handler) {
          await handler.execute(interaction, client);
        } else {
          console.log('[DEBUG] button handler NAO encontrado para:', interaction.customId);
        }

      // ── Select Menus ─────────────────────────────────────────
      } else if (
        interaction.isStringSelectMenu() ||
        interaction.isChannelSelectMenu() ||
        interaction.isRoleSelectMenu()
      ) {
        const handler = [...client.selectHandlers.values()].find(h => {
          if (h.customIdPrefix && interaction.customId.startsWith(h.customIdPrefix)) return true;
          if (h.customId && interaction.customId === h.customId) return true;
          return false;
        });
        if (handler) {
          await handler.execute(interaction, client);
        } else {
          console.log('[DEBUG] select handler NAO encontrado para:', interaction.customId);
        }

      // ── Modais ───────────────────────────────────────────────
      } else if (interaction.isModalSubmit()) {
        const handler = [...client.modalHandlers.values()].find(h => {
          if (h.customIdPrefix && interaction.customId.startsWith(h.customIdPrefix)) return true;
          if (h.customId && interaction.customId === h.customId) return true;
          return false;
        });
        if (handler) {
          await handler.execute(interaction, client);
        } else {
          console.log('[DEBUG] modal handler NAO encontrado para:', interaction.customId);
        }
      }

    } catch (error) {
      console.error('[InteractionCreate] Erro:', error);
      const reply = { content: '❌ Ocorreu um erro inesperado.', flags: (1 << 6) };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply).catch(() => {});
      } else {
        await interaction.reply(reply).catch(() => {});
      }
    }
  },
};