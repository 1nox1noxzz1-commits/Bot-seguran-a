# 🛡️ Anti-Raid Bot — Discord.js v14

Bot de segurança para servidores Discord com painel de controlo completo, proteções anti-raid, IA (Grok), backups e ações automáticas.

---

## 📁 Estrutura do Projeto

```
bot/
├── src/
│   ├── commands/admin/
│   │   └── painel.js          ← Comando /painel
│   ├── events/
│   │   ├── ready.js
│   │   ├── interactionCreate.js
│   │   ├── guildMemberAdd.js  ← Proteção bots + Entrada
│   │   ├── guildMemberRemove.js ← Deteção kick em massa
│   │   ├── guildBanAdd.js     ← Deteção ban em massa
│   │   ├── channelCreate.js   ← Proteção criação de canais
│   │   ├── webhooksUpdate.js  ← Proteção webhooks
│   │   └── messageCreate.js   ← Moderação IA
│   ├── components/
│   │   ├── buttons/
│   │   │   ├── painel.js      ← Navegação principal
│   │   │   ├── backup.js      ← Ações de backup
│   │   │   ├── ia.js          ← Configuração IA
│   │   │   ├── protecao.js    ← Toggle e logs de proteção
│   │   │   └── acoes.js       ← Mensagens + Entrada
│   │   ├── selects/
│   │   │   ├── backupRemoverSelect.js
│   │   │   ├── iaModelo.js
│   │   │   ├── iaLogsChannel.js
│   │   │   ├── protecaoSelect.js
│   │   │   ├── protecaoLogsChannel.js
│   │   │   ├── acoesMsgCanal.js
│   │   │   └── acoesEntradaCanal.js
│   │   └── modals/
│   │       ├── backupRemover.js
│   │       ├── ia.js
│   │       └── acoes.js
│   ├── utils/
│   │   ├── emojis.js          ← ⚠️ PREENCHER IDs DOS EMOJIS
│   │   ├── database.js        ← Persistência JSON
│   │   ├── backup.js          ← Lógica de backup
│   │   ├── grok.js            ← Integração Grok API
│   │   ├── protection.js      ← Utilitários anti-raid
│   │   ├── scheduler.js       ← Cron de mensagens automáticas
│   │   └── permissions.js
│   ├── index.js               ← Entry point
│   └── deploy.js              ← Registar slash commands
├── data/                      ← Criado automaticamente (configs + backups)
├── .env.example
├── package.json
└── README.md
```

---

## ⚡ Instalação

### 1. Instalar dependências

```bash
cd bot
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Editar `.env`:

```env
BOT_TOKEN=o_teu_token_do_discord_developer_portal
CLIENT_ID=id_da_aplicação_do_bot
GUILD_ID=id_do_servidor_para_dev   # remove esta linha em produção
OWNER_ID=o_teu_id_de_utilizador_discord
GROK_API_KEY=                      # opcional, podes definir pelo painel
```

### 3. Preencher IDs dos emojis

Edita `src/utils/emojis.js` e substitui todos os `ID_AQUI` pelos IDs reais dos teus emojis.

**Como obter o ID de um emoji:**
1. No Discord, escreve `\:nome_do_emoji:` num canal
2. O ID aparece no formato `<:nome:123456789>`
3. Copia apenas o número

Os ficheiros de emoji estão em `emojis/pacote/` — faz upload de todos para o teu servidor Discord.

### 4. Registar os Slash Commands

```bash
# Dev (instantâneo, para o servidor definido em GUILD_ID)
node src/deploy.js

# Produção (até 1h para propagar globalmente, remove GUILD_ID do .env)
node src/deploy.js
```

### 5. Iniciar o bot

```bash
node src/index.js

# Ou com auto-restart em desenvolvimento:
node --watch src/index.js
```

---

## 🎛️ Como Usar

### Comando Principal
```
/painel
```
Apenas o dono do bot (definido em `OWNER_ID`) pode abrir o painel.

### Navegação do Painel

| Botão | Funcionalidade |
|-------|---------------|
| 💾 Backup | Criar, listar e remover backups do servidor |
| 🤖 IA | Configurar Grok API, prompt e canal de logs |
| 🛡️ Proteção | Ativar proteções anti-raid individualmente |
| ⚙️ Ações Automáticas | Mensagens programadas + boas-vindas |

### Proteções Disponíveis

| Proteção | Comportamento |
|----------|--------------|
| **Adição de Bots** | Pede confirmação ao dono. Sem resposta → bot kickado |
| **Criação de Webhooks** | Pede confirmação. Sem resposta → webhook deletado |
| **Criação de Canais** | Pede confirmação. Sem resposta → canal deletado |
| **Ban em Massa** | Alerta ao dono se ≥3 bans em 10 segundos |
| **Kick em Massa** | Alerta ao dono se ≥3 kicks em 10 segundos |

### Sistema de Backup

- Cria backups de **canais**, **cargos** e **permissões**
- Envia **chave de segurança por DM** ao dono
- A chave é necessária para remover backups
- Chaves expiram após **10 minutos**

### IA (Grok)

- Analisa mensagens de texto em busca de conteúdo prejudicial
- Analisa imagens em base64 (requer modelo com visão, ex: `grok-vision-beta`)
- Deteta spam de padrões Unicode automaticamente (sem chamar API)
- Regista tudo no canal de logs configurado

### Mensagens Automáticas

Usa expressões **cron** para agendar:
- `0 * * * *` → a cada hora
- `0 9 * * *` → todos os dias às 9h
- `*/30 * * * *` → a cada 30 minutos
- `0 12 * * 1` → todas as segundas ao meio-dia

### Entrada

- Menciona o novo membro no canal configurado
- Apaga a mensagem automaticamente após **5 segundos**

---

## 📦 Dependências

```json
{
  "discord.js": "^14.16.3",
  "@discordjs/rest": "^2.4.0",
  "dotenv": "^16.4.7",
  "node-cron": "^3.0.3"
}
```

---

## ⚠️ Permissões Necessárias no Discord

O bot precisa das seguintes permissões no servidor:
- `Administrator` (recomendado para todas as proteções funcionarem)

Ou individualmente:
- `Manage Channels` — proteção de canais
- `Manage Webhooks` — proteção de webhooks
- `Kick Members` — proteção de bots / kicks
- `Ban Members` — deteção de bans em massa
- `Manage Messages` — moderação IA
- `View Audit Log` — verificações de moderação

---

## 🔧 Intents Necessários no Developer Portal

Em [discord.com/developers](https://discord.com/developers/applications), ativa:
- ✅ **Server Members Intent**
- ✅ **Message Content Intent**
- ✅ **Presence Intent** (opcional)
