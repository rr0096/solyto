# solyto-mcp

MCP server that gives any AI assistant full read/write access to your solyto personal data.

Covers: **Todos · Calendar · Contacts · Notes · Music · Books · Check-ins · Finance · Time tracking · Links · Recipes · Quotes · Games · News · Clipboard**

---

## Requirements

- Node.js 22+
- A running solyto instance (local or remote)
- Your solyto API token

---

## Install & build

```bash
cd mcp/solyto-mcp
npm install
npm run build
```

---

## Configuration

Set these two environment variables before running:

| Variable | Description | Default |
|---|---|---|
| `SOLYTO_API_URL` | Base URL of your solyto API | `http://localhost:8080` |
| `SOLYTO_TOKEN` | Bearer token from solyto settings | _(required)_ |

---

## Connect to Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)  
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "solyto": {
      "command": "node",
      "args": ["/absolute/path/to/solyto/mcp/solyto-mcp/dist/index.js"],
      "env": {
        "SOLYTO_API_URL": "https://your-solyto-instance.com",
        "SOLYTO_TOKEN": "your-token-here"
      }
    }
  }
}
```

Then restart Claude Desktop. You'll see solyto tools available in the tool picker.

---

## Connect to Claude Code (CLI)

Add to your project's `.claude/settings.json` or `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "solyto": {
      "command": "node",
      "args": ["/absolute/path/to/solyto/mcp/solyto-mcp/dist/index.js"],
      "env": {
        "SOLYTO_API_URL": "http://localhost:8080",
        "SOLYTO_TOKEN": "your-token-here"
      }
    }
  }
}
```

Or add it via the CLI:

```bash
claude mcp add solyto \
  -e SOLYTO_API_URL=http://localhost:8080 \
  -e SOLYTO_TOKEN=your-token \
  -- node /absolute/path/to/solyto/mcp/solyto-mcp/dist/index.js
```

---

## Available tools

| Module | Tools |
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

## Development (no build step)

```bash
SOLYTO_API_URL=http://localhost:8080 SOLYTO_TOKEN=xxx npm run dev
```
