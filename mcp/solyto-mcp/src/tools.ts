import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export const TOOLS = [
  // ── Todos ────────────────────────────────────────────────────────────────
  {
    name: "list_todos",
    description: "List all todos. Optionally filter by list, status or tag.",
    inputSchema: {
      type: "object",
      properties: {
        list_id: { type: "string" },
        status: { type: "string", enum: ["open", "done"] },
        tag: { type: "string" },
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
        priority: { type: "integer", description: "1=low 2=medium 3=high" },
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
    description: "Delete a todo.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },

  // ── Calendar ──────────────────────────────────────────────────────────────
  {
    name: "list_events",
    description: "List calendar events in a date range.",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string", description: "ISO 8601" },
        to: { type: "string", description: "ISO 8601" },
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
        start: { type: "string" },
        end: { type: "string" },
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
    description: "List contacts.",
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
    description: "Get a contact by ID.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
  },
  {
    name: "create_contact",
    description: "Create a contact.",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
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
    description: "List notes/notebooks.",
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
    description: "Create a note (markdown).",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        content: { type: "string" },
        folder_id: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "update_note",
    description: "Update a note.",
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

  // ── Music ─────────────────────────────────────────────────────────────────
  {
    name: "list_music",
    description: "List artists or albums.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["artists", "albums"] },
        search: { type: "string" },
      },
    },
  },
  {
    name: "add_music",
    description: "Add an artist or album.",
    inputSchema: {
      type: "object",
      required: ["name", "type"],
      properties: {
        name: { type: "string" },
        type: { type: "string", enum: ["artist", "album"] },
        artist_id: { type: "string" },
        notes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },

  // ── Books ─────────────────────────────────────────────────────────────────
  {
    name: "list_books",
    description: "List books.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["want_to_read", "reading", "read"] },
        search: { type: "string" },
      },
    },
  },
  {
    name: "add_book",
    description: "Add a book.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        author: { type: "string" },
        status: { type: "string", enum: ["want_to_read", "reading", "read"] },
        rating: { type: "integer" },
        notes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "update_book",
    description: "Update a book.",
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

  // ── Check-in ──────────────────────────────────────────────────────────────
  {
    name: "list_checkins",
    description: "List check-in entries (mood, health…).",
    inputSchema: {
      type: "object",
      properties: {
        from: { type: "string" },
        to: { type: "string" },
      },
    },
  },
  {
    name: "create_checkin",
    description: "Create a check-in entry.",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string" },
        mood: { type: "integer", description: "1-5" },
        energy: { type: "integer", description: "1-5" },
        notes: { type: "string" },
        fields: { type: "object" },
      },
    },
  },

  // ── Finance ───────────────────────────────────────────────────────────────
  {
    name: "list_finance",
    description: "List income, expenses or wealth.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["income", "wealth", "expense"] },
        from: { type: "string" },
        to: { type: "string" },
      },
    },
  },
  {
    name: "create_finance_entry",
    description: "Add a finance entry.",
    inputSchema: {
      type: "object",
      required: ["type", "amount"],
      properties: {
        type: { type: "string", enum: ["income", "wealth", "expense"] },
        amount: { type: "number" },
        currency: { type: "string" },
        date: { type: "string" },
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
    description: "Log a time entry.",
    inputSchema: {
      type: "object",
      required: ["duration_minutes"],
      properties: {
        duration_minutes: { type: "integer" },
        project: { type: "string" },
        description: { type: "string" },
        date: { type: "string" },
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
    description: "Save a link.",
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
    description: "List games.",
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
    description: "Add a game.",
    inputSchema: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string" },
        platform: { type: "string" },
        status: { type: "string", enum: ["want_to_play", "playing", "played"] },
        rating: { type: "integer" },
        notes: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
    },
  },

  // ── News ──────────────────────────────────────────────────────────────────
  {
    name: "list_news_feeds",
    description: "List subscribed news feeds.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_news_items",
    description: "List news items.",
    inputSchema: {
      type: "object",
      properties: {
        feed_id: { type: "string" },
        unread_only: { type: "boolean" },
        limit: { type: "integer" },
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
    description: "Save to clipboard (cross-device).",
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
// HTTP helper
// ---------------------------------------------------------------------------
export function makeApiClient(apiUrl: string, token: string) {
  return async function api<T = unknown>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const res = await fetch(`${apiUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) {
      throw new McpError(
        ErrorCode.InternalError,
        `solyto API error ${res.status} on ${method} ${path}: ${text}`
      );
    }
    return text ? (JSON.parse(text) as T) : ({} as T);
  };
}

function buildQuery(args: Record<string, unknown>, keys: string[]): string {
  const params = new URLSearchParams();
  for (const key of keys) {
    const val = args[key];
    if (val !== undefined && val !== null) params.set(key, String(val));
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------
export async function dispatch(
  name: string,
  args: Record<string, unknown>,
  api: ReturnType<typeof makeApiClient>
): Promise<unknown> {
  switch (name) {
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

    case "list_music":
      return api(
        "GET",
        `/${args.type === "albums" ? "music/albums" : "music/artists"}${buildQuery(args, ["search"])}`
      );
    case "add_music":
      return api("POST", `/music/${args.type}s`, args);

    case "list_books":
      return api("GET", `/books${buildQuery(args, ["status", "search"])}`);
    case "add_book":
      return api("POST", "/books", args);
    case "update_book": {
      const { id, ...body } = args;
      return api("PUT", `/books/${id}`, body);
    }

    case "list_checkins":
      return api("GET", `/checkins${buildQuery(args, ["from", "to"])}`);
    case "create_checkin":
      return api("POST", "/checkins", args);

    case "list_finance":
      return api("GET", `/finance${buildQuery(args, ["type", "from", "to"])}`);
    case "create_finance_entry":
      return api("POST", "/finance", args);

    case "list_time_entries":
      return api("GET", `/time${buildQuery(args, ["from", "to", "project"])}`);
    case "create_time_entry":
      return api("POST", "/time", args);

    case "list_links":
      return api("GET", `/links${buildQuery(args, ["search", "tag"])}`);
    case "save_link":
      return api("POST", "/links", args);

    case "list_recipes":
      return api("GET", `/recipes${buildQuery(args, ["search", "tag"])}`);
    case "create_recipe":
      return api("POST", "/recipes", args);

    case "list_quotes":
      return api("GET", `/quotes${buildQuery(args, ["search", "author"])}`);
    case "save_quote":
      return api("POST", "/quotes", args);

    case "list_games":
      return api("GET", `/games${buildQuery(args, ["status", "search"])}`);
    case "add_game":
      return api("POST", "/games", args);

    case "list_news_feeds":
      return api("GET", "/news/feeds");
    case "list_news_items":
      return api("GET", `/news/items${buildQuery(args, ["feed_id", "unread_only", "limit"])}`);
    case "mark_news_read":
      return api("POST", `/news/items/${args.id}/read`);

    case "list_clipboard":
      return api("GET", "/clipboard");
    case "save_clipboard":
      return api("POST", "/clipboard", args);

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
}
