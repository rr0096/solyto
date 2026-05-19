#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Config — set SOLYTO_API_URL and SOLYTO_TOKEN in env or .env file
// ---------------------------------------------------------------------------
const API_URL = process.env.SOLYTO_API_URL ?? "http://localhost:8080";
const TOKEN = process.env.SOLYTO_TOKEN ?? "";

if (!TOKEN) {
  process.stderr.write(
    "Warning: SOLYTO_TOKEN is not set. Most requests will be rejected.\n"
  );
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------
async function api<T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new McpError(
      ErrorCode.InternalError,
      `API error ${res.status} on ${method} ${path}: ${text}`
    );
  }

  return text ? (JSON.parse(text) as T) : ({} as T);
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------
const TOOLS = [
  // ── Todos ────────────────────────────────────────────────────────────────
  {
    name: "list_todos",
    description: "List all todos. Optionally filter by list, status or tag.",
    inputSchema: {
      type: "object",
      properties: {
        list_id: { type: "string", description: "Filter by list ID" },
        status: {
          type: "string",
          enum: ["open", "done"],
          description: "Filter by status",
        },
        tag: { type: "string", description: "Filter by tag" },
      },
    },
  },
  {
    name: "create_todo",
    description: "Create a new todo item.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        notes: { type: "string" },
        due_date: { type: "string", description: "ISO 8601 date" },
        list_id: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        priority: { type: "integer", description: "1 = low, 2 = medium, 3 = high" },
      },
    },
  },
  {
    name: "update_todo",
    description: "Update an existing todo.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        notes: { type: "string" },
        due_date: { type: "string" },
        status: { type: "string", enum: ["open", "done"] },
        list_id: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        priority: { type: "integer" },
      },
    },
  },
  {
    name: "delete_todo",
    description: "Delete a todo by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },

  // ── Calendar ──────────────────────────────────────────────────────────────
  {
    name: "list_events",
    description: "List calendar events within a date range.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "ISO 8601 start date" },
        to: { type: "string", description: "ISO 8601 end date" },
        calendar_id: { type: "string" },
      },
    },
  },
  {
    name: "create_event",
    description: "Create a calendar event.",
    inputSchema: {
      type: "object",
      required: ["title", "start"],
      properties: {
        title: { type: "string" },
        start: { type: "string", description: "ISO 8601" },
        end: { type: "string", description: "ISO 8601" },
        all_day: { type: "boolean" },
        description: { type: "string" },
        location: { type: "string" },
        calendar_id: { type: "string" },
      },
    },
  },
  {
    name: "update_event",
    description: "Update a calendar event.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        start: { type: "string" },
        end: { type: "string" },
        all_day: { type: "boolean" },
        description: { type: "string" },
        location: { type: "string" },
      },
    },
  },
  {
    name: "delete_event",
    description: "Delete a calendar event.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },

  // ── Contacts ──────────────────────────────────────────────────────────────
  {
    name: "list_contacts",
    description: "List contacts. Optionally search by name or tag.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string" },
        tag: { type: "string" },
      },
    },
  },
  {
    name: "get_contact",
    description: "Get a single contact by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "create_contact",
    description: "Create a new contact.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        birthday: { type: "string", description: "ISO 8601 date" },
        notes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "update_contact",
    description: "Update a contact.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        birthday: { type: "string" },
        notes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "delete_contact",
    description: "Delete a contact.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },

  // ── Notes ─────────────────────────────────────────────────────────────────
  {
    name: "list_notes",
    description: "List notes/notebooks. Optionally filter by folder.",
    inputSchema: {
      type: "object",
      properties: {
        folder_id: { type: "string" },
        search: { type: "string" },
      },
    },
  },
  {
    name: "get_note",
    description: "Get the full content of a note.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "create_note",
    description: "Create a new note.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        content: { type: "string", description: "Markdown content" },
        folder_id: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "update_note",
    description: "Update an existing note.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        content: { type: "string" },
        folder_id: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "delete_note",
    description: "Delete a note.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },

  // ── Music Library ─────────────────────────────────────────────────────────
  {
    name: "list_music",
    description: "List artists/albums in the music library.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["artists", "albums"],
          description: "What to list (default: artists)",
        },
        search: { type: "string" },
      },
    },
  },
  {
    name: "add_music",
    description: "Add an artist or album to the music library.",
    inputSchema: {
      type: "object",
      required: ["name", "type"],
      properties: {
        name: { type: "string" },
        type: { type: "string", enum: ["artist", "album"] },
        artist_id: {
          type: "string",
          description: "Required when type is album",
        },
        notes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },

  // ── Book Library ──────────────────────────────────────────────────────────
  {
    name: "list_books",
    description: "List books in the library.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["want_to_read", "reading", "read"],
        },
        search: { type: "string" },
      },
    },
  },
  {
    name: "add_book",
    description: "Add a book to the library.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        author: { type: "string" },
        status: {
          type: "string",
          enum: ["want_to_read", "reading", "read"],
        },
        rating: { type: "integer", description: "1-5" },
        notes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "update_book",
    description: "Update a book entry.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        status: { type: "string", enum: ["want_to_read", "reading", "read"] },
        rating: { type: "integer" },
        notes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },

  // ── Check-In (mood / health) ───────────────────────────────────────────────
  {
    name: "list_checkins",
    description: "List check-in entries (mood, health, custom fields).",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "ISO 8601 date" },
        to: { type: "string", description: "ISO 8601 date" },
      },
    },
  },
  {
    name: "create_checkin",
    description: "Create a new check-in entry.",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", description: "ISO 8601 date (default: today)" },
        mood: { type: "integer", description: "1-5 scale" },
        energy: { type: "integer", description: "1-5 scale" },
        notes: { type: "string" },
        fields: {
          type: "object",
          description: "Any additional custom key/value fields",
        },
      },
    },
  },

  // ── Finance ───────────────────────────────────────────────────────────────
  {
    name: "list_finance",
    description: "List income and wealth entries.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["income", "wealth", "expense"] },
        from: { type: "string", description: "ISO 8601 date" },
        to: { type: "string", description: "ISO 8601 date" },
      },
    },
  },
  {
    name: "create_finance_entry",
    description: "Create a finance entry (income, expense or wealth snapshot).",
    inputSchema: {
      type: "object",
      required: ["type", "amount"],
      properties: {
        type: { type: "string", enum: ["income", "wealth", "expense"] },
        amount: { type: "number" },
        currency: { type: "string", description: "ISO 4217, e.g. EUR" },
        date: { type: "string", description: "ISO 8601" },
        category: { type: "string" },
        notes: { type: "string" },
      },
    },
  },

  // ── Time Tracking ─────────────────────────────────────────────────────────
  {
    name: "list_time_entries",
    description: "List time tracking entries.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string" },
        to: { type: "string" },
        project: { type: "string" },
      },
    },
  },
  {
    name: "create_time_entry",
    description: "Log a time tracking entry.",
    inputSchema: {
      type: "object",
      required: ["duration_minutes"],
      properties: {
        duration_minutes: { type: "integer" },
        project: { type: "string" },
        description: { type: "string" },
        date: { type: "string", description: "ISO 8601" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },

  // ── Links ─────────────────────────────────────────────────────────────────
  {
    name: "list_links",
    description: "List saved links.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string" },
        tag: { type: "string" },
      },
    },
  },
  {
    name: "save_link",
    description: "Save a link to the library.",
    inputSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string" },
        title: { type: "string" },
        notes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },

  // ── Recipes ───────────────────────────────────────────────────────────────
  {
    name: "list_recipes",
    description: "List recipes.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string" },
        tag: { type: "string" },
      },
    },
  },
  {
    name: "create_recipe",
    description: "Add a recipe.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        ingredients: { type: "string" },
        instructions: { type: "string" },
        servings: { type: "integer" },
        tags: { type: "array", items: { type: "string" } },
        notes: { type: "string" },
      },
    },
  },

  // ── Quotes ────────────────────────────────────────────────────────────────
  {
    name: "list_quotes",
    description: "List saved quotes.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string" },
        author: { type: "string" },
      },
    },
  },
  {
    name: "save_quote",
    description: "Save a quote.",
    inputSchema: {
      type: "object",
      required: ["text"],
      properties: {
        text: { type: "string" },
        author: { type: "string" },
        source: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },

  // ── Games ─────────────────────────────────────────────────────────────────
  {
    name: "list_games",
    description: "List games in the library.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["want_to_play", "playing", "played"] },
        search: { type: "string" },
      },
    },
  },
  {
    name: "add_game",
    description: "Add a game to the library.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        platform: { type: "string" },
        status: { type: "string", enum: ["want_to_play", "playing", "played"] },
        rating: { type: "integer", description: "1-5" },
        notes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },

  // ── News / RSS ────────────────────────────────────────────────────────────
  {
    name: "list_news_feeds",
    description: "List subscribed news feeds.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_news_items",
    description: "List news items (unread by default).",
    inputSchema: {
      type: "object",
      properties: {
        feed_id: { type: "string" },
        unread_only: { type: "boolean" },
        limit: { type: "integer", description: "Max items to return" },
      },
    },
  },
  {
    name: "mark_news_read",
    description: "Mark a news item as read.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },

  // ── Clipboard ─────────────────────────────────────────────────────────────
  {
    name: "list_clipboard",
    description: "List clipboard entries.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "save_clipboard",
    description: "Save content to the clipboard (cross-device).",
    inputSchema: {
      type: "object",
      required: ["content"],
      properties: {
        content: { type: "string" },
        label: { type: "string" },
      },
    },
  },
] as const;

// ---------------------------------------------------------------------------
// Route a tool call to the correct API path
// ---------------------------------------------------------------------------
async function dispatch(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    // Todos
    case "list_todos":
      return api("GET", `/todos${buildQuery(args, ["list_id", "status", "tag"])}`);
    case "create_todo":
      return api("POST", "/todos", args);
    case "update_todo": {
      const { id, ...body } = args;
      return api("PUT", `/todos/${id}`, body);
    }
    case "delete_todo":
      return api("DELETE", `/todos/${args.id}`);

    // Calendar
    case "list_events":
      return api("GET", `/calendar/events${buildQuery(args, ["from", "to", "calendar_id"])}`);
    case "create_event":
      return api("POST", "/calendar/events", args);
    case "update_event": {
      const { id, ...body } = args;
      return api("PUT", `/calendar/events/${id}`, body);
    }
    case "delete_event":
      return api("DELETE", `/calendar/events/${args.id}`);

    // Contacts
    case "list_contacts":
      return api("GET", `/contacts${buildQuery(args, ["search", "tag"])}`);
    case "get_contact":
      return api("GET", `/contacts/${args.id}`);
    case "create_contact":
      return api("POST", "/contacts", args);
    case "update_contact": {
      const { id, ...body } = args;
      return api("PUT", `/contacts/${id}`, body);
    }
    case "delete_contact":
      return api("DELETE", `/contacts/${args.id}`);

    // Notes
    case "list_notes":
      return api("GET", `/notes${buildQuery(args, ["folder_id", "search"])}`);
    case "get_note":
      return api("GET", `/notes/${args.id}`);
    case "create_note":
      return api("POST", "/notes", args);
    case "update_note": {
      const { id, ...body } = args;
      return api("PUT", `/notes/${id}`, body);
    }
    case "delete_note":
      return api("DELETE", `/notes/${args.id}`);

    // Music
    case "list_music":
      return api(
        "GET",
        `/${args.type === "albums" ? "music/albums" : "music/artists"}${buildQuery(args, ["search"])}`
      );
    case "add_music":
      return api("POST", `/music/${args.type}s`, args);

    // Books
    case "list_books":
      return api("GET", `/books${buildQuery(args, ["status", "search"])}`);
    case "add_book":
      return api("POST", "/books", args);
    case "update_book": {
      const { id, ...body } = args;
      return api("PUT", `/books/${id}`, body);
    }

    // Check-in
    case "list_checkins":
      return api("GET", `/checkins${buildQuery(args, ["from", "to"])}`);
    case "create_checkin":
      return api("POST", "/checkins", args);

    // Finance
    case "list_finance":
      return api("GET", `/finance${buildQuery(args, ["type", "from", "to"])}`);
    case "create_finance_entry":
      return api("POST", "/finance", args);

    // Time tracking
    case "list_time_entries":
      return api("GET", `/time${buildQuery(args, ["from", "to", "project"])}`);
    case "create_time_entry":
      return api("POST", "/time", args);

    // Links
    case "list_links":
      return api("GET", `/links${buildQuery(args, ["search", "tag"])}`);
    case "save_link":
      return api("POST", "/links", args);

    // Recipes
    case "list_recipes":
      return api("GET", `/recipes${buildQuery(args, ["search", "tag"])}`);
    case "create_recipe":
      return api("POST", "/recipes", args);

    // Quotes
    case "list_quotes":
      return api("GET", `/quotes${buildQuery(args, ["search", "author"])}`);
    case "save_quote":
      return api("POST", "/quotes", args);

    // Games
    case "list_games":
      return api("GET", `/games${buildQuery(args, ["status", "search"])}`);
    case "add_game":
      return api("POST", "/games", args);

    // News
    case "list_news_feeds":
      return api("GET", "/news/feeds");
    case "list_news_items":
      return api("GET", `/news/items${buildQuery(args, ["feed_id", "unread_only", "limit"])}`);
    case "mark_news_read":
      return api("POST", `/news/items/${args.id}/read`);

    // Clipboard
    case "list_clipboard":
      return api("GET", "/clipboard");
    case "save_clipboard":
      return api("POST", "/clipboard", args);

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
}

// ---------------------------------------------------------------------------
// Query string helper
// ---------------------------------------------------------------------------
function buildQuery(
  args: Record<string, unknown>,
  keys: string[]
): string {
  const params = new URLSearchParams();
  for (const key of keys) {
    const val = args[key];
    if (val !== undefined && val !== null) {
      params.set(key, String(val));
    }
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------
const server = new Server(
  { name: "solyto-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  try {
    const result = await dispatch(name, args as Record<string, unknown>);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    if (err instanceof McpError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new McpError(ErrorCode.InternalError, msg);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write("solyto-mcp running\n");
