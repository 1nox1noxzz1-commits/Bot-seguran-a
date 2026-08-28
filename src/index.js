require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel],
});

// Collections para handlers
client.commands       = new Collection();
client.buttonHandlers = new Collection();
client.selectHandlers = new Collection();
client.modalHandlers  = new Collection();

// ── Auto-loader de comandos ─────────────────────────────────────
function loadFolder(basePath, collection, getter) {
  if (!fs.existsSync(basePath)) return;
  for (const entry of fs.readdirSync(basePath, { withFileTypes: true })) {
    const full = path.join(basePath, entry.name);
    if (entry.isDirectory()) {
      loadFolder(full, collection, getter);
    } else if (entry.name.endsWith('.js')) {
      const mod = require(full);
      const key = getter(mod);
      if (key) collection.set(key, mod);
    }
  }
}

loadFolder(path.join(__dirname, 'commands'),           client.commands,       m => m.data?.name);
loadFolder(path.join(__dirname, 'components/buttons'), client.buttonHandlers, m => m.customIdPrefix || m.customId);
loadFolder(path.join(__dirname, 'components/selects'), client.selectHandlers, m => m.customIdPrefix || m.customId);
loadFolder(path.join(__dirname, 'components/modals'),  client.modalHandlers,  m => m.customIdPrefix || m.customId);

// ── Auto-loader de eventos ──────────────────────────────────────
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ── Carregar emojis da aplicação automaticamente ────────────────
client.once('ready', async () => {
  try {
    const appEmojis = await client.application.emojis.fetch();

    // Constrói um mapa nome -> emoji utilizável
    client.appEmojis = {};
    for (const emoji of appEmojis.values()) {
      client.appEmojis[emoji.name] = emoji.toString(); // ex: <:db:123456789>
    }

    console.log(`✅ ${appEmojis.size} emojis da aplicação carregados.`);
  } catch (err) {
    console.error('❌ Erro ao carregar emojis da aplicação:', err);
  }
});

client.login(process.env.BOT_TOKEN);