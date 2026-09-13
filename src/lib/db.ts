import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "hexchange.db");

if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), {recursive: true});
}

const db = new Database(DB_PATH);
db.program("journal_mode = WAL"); /* Set the journal mode to Write-Ahead Logging (WAL) for better concurrency and performance. */

db.exec(`
CREATE TABLE IF NOT EXISTS characters (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 role TEXT NOT NULL,
 image_url TEXT,
 price REAL NOT NULL,
 shares_outstanding REAL NOT NULL DEFAULT 1000,
 created_at TEXT NOT NULL DEFAULT (datetime('now))
);

CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 handle TEXT NOT NULL,
 balance REAL NOT NULL DEFAULT 10000,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS holdings (
 user_id TEXT  NOT NULL,
 character_id TEXT NOT NULL,
 shares REAL NOT NULL DEFAULT 0,
 cost_basis REAL NOT NULL DEFAULT 0,
 PRIMARY KEY (user_id, character_id)
);

CREATE TABLE IF NOT EXISTS transactions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id TEXT NOT NULL,
 character_id TEXT NOT NULL,
 side TEXT NOT NULL,
 shares REAL NOT NULL,
 price REAL NOT NULL,
 total REAL NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now))
);

CREATE TABLE IF NOT EXISTS price_history (
 character_id TEXT NOT NULL,
 price REAL NOT NULL,
 ts TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

const seedCount = db.prepare("SELECT COUNT(*) as c FROM characters").get() as {c:number};

if (seedCount.c === 0) {
    const insert = db.prepare(
        `INSERT INTO characters (id, name, role, image_url, price, shares_outstanding) VALUES (?,?,?,?,?,?)`
    );

// Though there are no defined roles in deadlock
// I am using general names

const seed: [string,string,string,string,number,number][] = [
    ["abrams","Abrams", "Tank", "",100, 5000],
    ["apollo","Apollo","Initiator", "", 79,5000],
    ["bebop","Bebop","Clanker","",80,5000],
    ["billy","Billy", "Tank","", 92,5000],
    ["calico","Calico","Assassin","",60,5000],
    ["celeste","Celeste","Brawler","",94,5000],
    ["doorman","The Doorman","Disruptor","",75,5000],
    ["drifter","Drifter","Assassin","",79,5000],
    ["dynamo","Dynamo","Playmaker","",90,5000],
    ["graves","Graves","","",50,5000],
    ["grey talon","Grey Talon","Marksman","",80,5000],
    ["haze","Haze","Assassin","",85,5000],
    ["holliday","Holliday","Playmaker","",80,5000],
    ["infernus","Infernus","Carry","",87,5000],
    ["ivy","Ivy","Support","",82,5000],
    ["kelvin","Kelvin","Support","",80,5000],
    ["lady_geist","Lady Geist","Carry","",89,5000],
    ["lash","Lash","Initiator","",90,5000],
    ["mcginnis","McGinnis","Disruptor","",80,5000],
    ["mina","Mina","Harasser","",87,5000],
    ["mirage","Mirage","Disruptor","",88,5000],
    ["mo_and_krill","Mo&Krill","Initiator","",80,5000],
    ["paige","Paige","Support","",80,5000],
    ["paradox","Paradox","Playmaker","",80,5000],
    ["pocket","Pocket","Disruptor","",90,5000],
    ["rem","Rem","Support","",80,5000],
    ["seven","Seven","Carry","",90,5000],
    ["shiv","Shiv","Brawler","",80,5000],
    ["silver","Silver","Useless","",80,5000],
    ["sinclair","Sinclair","Flex","",80,5000],
    ["venator","Venator","Carry","",80,5000],
    ["victor","Victor","Brawler","",70,5000],
    ["vindicta","Vindicta","Marksman","",76,5000],
    ["viscous","Viscous","Disruptor","",80,5000],
    ["vyper","Vyper","Carry","",95,5000],
    ["warden","Warden","Carry","",96,5000],
    ["wraith","Wraith","Carry","",98,5000],
    ["yamato","Yamato","Brawler","",80,5000],
];
const insertHistory = db.prepare(
    `INSERT INTO price_history (character_id, price) VALUES (?,?)`
);
const tx=db.transaction(() => {
    for (const c of seed) {
        insert.run(...c);
        insertHistory.run(c[0], c[4]);
    }
});
tx();
}

export default db;