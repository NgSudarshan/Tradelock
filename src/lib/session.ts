import { cookies } from "next/headers";
import db from "./db";
import { User } from "./types";

const COOKIE_NAME = "hexchange_uid";
const HANDLES = [//Generating random user handles 
  "Metro Grooming",
  "Oh Deathy",
  "Melee Creeps",
  "DLNS Fan",
  "Egg Buyer",
  "Elo Hell",
  "1K Soul Bag",
  "Hidden King",
  "Archmother",
];

function randomHandle() {
  const base = HANDLES[Math.floor(Math.random() * HANDLES.length)];
  return `${base} ${Math.floor(Math.random() * 1000)}`;
}

// The `hexchange_uid` cookie itself is assigned by middleware.ts, since cookies
// can only be written in middleware, Server Actions, or Route Handlers, not
// during a page's render. Here we just read it and create the DB row
// the first time we see a given id — a DB write is fine during render.
export async function getOrCreateUser(): Promise<User> {
  const cookieStore = await cookies();
  const uid = cookieStore.get(COOKIE_NAME)?.value;

  if (!uid) {
    throw new Error(
      "Missing guest session cookie. This shouldn't happen if middleware.ts is running."
    );
  }

  const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(uid) as
    | User
    | undefined;
  if (existing) return existing;

  const handle = randomHandle();
  db.prepare("INSERT INTO users (id, handle, balance) VALUES (?, ?, 10000)").run(uid, handle);
  return db.prepare("SELECT * FROM users WHERE id = ?").get(uid) as User;
}

export { COOKIE_NAME };