# solyto-mcp

MCP server with full read/write access to all solyto modules.

**Dos modos:**
- **`stdio`** — para Claude Desktop, Claude Code y clientes locales (sin red)
- **`--http`** — para Claude.ai web y cualquier cliente remoto

---

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `SOLYTO_API_URL` | URL base de tu instancia solyto | `http://localhost:8080` |
| `SOLYTO_TOKEN` | Bearer token de solyto | *(requerido)* |
| `MCP_AUTH_KEY` | Clave secreta que deben enviar los clientes (recomendado en modo HTTP) | *(vacío = sin auth)* |
| `PORT` | Puerto HTTP | `3000` |

---

## Instalación y compilación

```bash
cd mcp/solyto-mcp
npm install
npm run build
```

---

## Modo HTTP — para Claude.ai web

### 1. Despliega el servidor

**Opción A — Railway (más fácil)**

1. Crea cuenta en railway.app
2. "New project → Deploy from GitHub repo" → selecciona `rr0096/solyto`
3. Set root directory: `mcp/solyto-mcp`
4. Variables de entorno:
   ```
   SOLYTO_API_URL=https://tu-solyto.com
   SOLYTO_TOKEN=tu-token-de-solyto
   MCP_AUTH_KEY=una-clave-secreta-larga
   PORT=3000
   ```
5. Railway te dará una URL pública como `https://solyto-mcp-production.up.railway.app`

**Opción B — Docker en tu VPS**

```bash
# En tu servidor
docker build -t solyto-mcp .
docker run -d \
  -p 3000:3000 \
  -e SOLYTO_API_URL=https://tu-solyto.com \
  -e SOLYTO_TOKEN=tu-token \
  -e MCP_AUTH_KEY=una-clave-secreta \
  solyto-mcp
```
Pon nginx delante para HTTPS (requerido por Claude.ai).

**Opción C — Local con túnel (para probar)**

```bash
# Terminal 1
SOLYTO_API_URL=http://localhost:8080 \
SOLYTO_TOKEN=tu-token \
MCP_AUTH_KEY=mi-clave \
node dist/index.js --http

# Terminal 2 — expone el puerto con ngrok
npx ngrok http 3000
# → obtienes https://xxxx.ngrok-free.app
```

### 2. Conecta en Claude.ai

1. Ve a [claude.ai](https://claude.ai) → **Settings** → **Integrations**
2. Haz clic en **"Add integration"** → **"Add custom integration"**
3. Rellena:
   - **Name:** `solyto`
   - **Integration URL:** `https://tu-url-publica/mcp`
4. Si activaste `MCP_AUTH_KEY`, Claude.ai pedirá autenticación — introduce la clave como token Bearer
5. Guarda → verás las 42 herramientas disponibles en cualquier conversación

---

## Modo stdio — para Claude Desktop / Claude Code

### Claude Desktop

Añade en `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
o `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "solyto": {
      "command": "node",
      "args": ["/ruta/absoluta/mcp/solyto-mcp/dist/index.js"],
      "env": {
        "SOLYTO_API_URL": "http://localhost:8080",
        "SOLYTO_TOKEN": "tu-token"
      }
    }
  }
}
```

### Claude Code (CLI)

```bash
claude mcp add solyto \
  -e SOLYTO_API_URL=http://localhost:8080 \
  -e SOLYTO_TOKEN=tu-token \
  -- node /ruta/absoluta/mcp/solyto-mcp/dist/index.js
```

---

## Herramientas disponibles (42)

| Módulo | Herramientas |
|---|---|
| Todos | `list_todos` `create_todo` `update_todo` `delete_todo` |
| Calendar | `list_events` `create_event` `update_event` `delete_event` |
| Contacts | `list_contacts` `get_contact` `create_contact` `update_contact` `delete_contact` |
| Notes | `list_notes` `get_note` `create_note` `update_note` `delete_note` |
| Music | `list_music` `add_music` |
| Books | `list_books` `add_book` `update_book` |
| Check-in | `list_checkins` `create_checkin` |
| Finance | `list_finance` `create_finance_entry` |
| Time | `list_time_entries` `create_time_entry` |
| Links | `list_links` `save_link` |
| Recipes | `list_recipes` `create_recipe` |
| Quotes | `list_quotes` `save_quote` |
| Games | `list_games` `add_game` |
| News | `list_news_feeds` `list_news_items` `mark_news_read` |
| Clipboard | `list_clipboard` `save_clipboard` |

---

## Desarrollo (sin compilar)

```bash
SOLYTO_API_URL=http://localhost:8080 SOLYTO_TOKEN=xxx npm run dev
# o en modo HTTP:
PORT=3000 MCP_AUTH_KEY=test SOLYTO_TOKEN=xxx npm run dev -- --http
```
