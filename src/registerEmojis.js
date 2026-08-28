require('dotenv').config();
const fs = require('fs');
const path = require('path');

const EMOJIS_DIR = path.join(__dirname, '..', 'emojis', 'Pacote');
const OUTPUT_JSON = path.join(__dirname, 'utils', 'emojis.json');
const API_BASE = 'https://discord.com/api/v10';
const APP_ID = process.env.CLIENT_ID;
const TOKEN = process.env.BOT_TOKEN;

async function fetchExistingEmojis() {
  const res = await fetch(`${API_BASE}/applications/${APP_ID}/emojis`, {
    headers: { Authorization: `Bot ${TOKEN}` },
  });
  const data = await res.json();
  return data.items ?? [];
}

async function deleteEmoji(id) {
  await fetch(`${API_BASE}/applications/${APP_ID}/emojis/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bot ${TOKEN}` },
  });
}

async function uploadEmoji(name, base64, type) {
  const res = await fetch(`${API_BASE}/applications/${APP_ID}/emojis`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, image: `data:${type};base64,${base64}` }),
  });
  return res.json();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  console.log('🔍 A verificar emojis existentes na aplicação...');
  const existing = await fetchExistingEmojis();
  console.log(`   Encontrados ${existing.length} emojis já registados.`);

  // Apaga os que já existem para evitar duplicados
  for (const emoji of existing) {
    process.stdout.write(`   🗑️  A apagar: ${emoji.name}...`);
    await deleteEmoji(emoji.id);
    process.stdout.write(' ✓\n');
    await sleep(300);
  }

  const files = fs.readdirSync(EMOJIS_DIR).filter(f =>
    ['.png', '.gif', '.jpg', '.jpeg', '.webp'].includes(path.extname(f).toLowerCase())
  );

  console.log(`\n📦 A registar ${files.length} emojis...\n`);

  const result = {};

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);
    const filePath = path.join(EMOJIS_DIR, file);
    const base64 = fs.readFileSync(filePath).toString('base64');
    const mimeType = ext === '.gif' ? 'image/gif' : ext === '.webp' ? 'image/webp' : 'image/png';
    const animated = ext === '.gif';

    process.stdout.write(`   ${animated ? '🎞️ ' : '🖼️ '} ${name}...`);

    try {
      const emoji = await uploadEmoji(name, base64, mimeType);

      if (emoji.id) {
        const format = animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`;
        result[name] = format;
        process.stdout.write(` ✅ ${format}\n`);
      } else {
        process.stdout.write(` ❌ Erro: ${JSON.stringify(emoji)}\n`);
      }
    } catch (err) {
      process.stdout.write(` ❌ Exceção: ${err.message}\n`);
    }

    await sleep(500); // evitar rate limit
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n✅ Concluído! ${Object.keys(result).length}/${files.length} emojis registados.`);
  console.log(`💾 IDs guardados em: ${OUTPUT_JSON}`);
})();