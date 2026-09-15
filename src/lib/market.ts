import db from "./db";
import { Character } from "./types";

// How hard a trade pushes the price. Bigger trades relative to the
// character's float move the price more, like a thin-float stock.
const IMPACT_FACTOR = 0.9;
const MIN_PRICE = 0.5;
const MAX_TRADE_PCT_OF_FLOAT = 0.15; // anti-rugpull: cap trade size per order

export function getCharacter(id: string): Character | undefined {
  return db.prepare("SELECT * FROM characters WHERE id = ?").get(id) as
    | Character
    | undefined;
}

export function priceImpact(price: number, shares: number, floatSize: number) {
  const fraction = shares / floatSize;
  return price * fraction * IMPACT_FACTOR;
}

export class TradeError extends Error {}

export function executeTrade(opts: {
  userId: string;
  characterId: string;
  shares: number;
  side: "buy" | "sell";
}) {
  const { userId, characterId, shares, side } = opts;
  if (!Number.isFinite(shares) || shares <= 0) {
    throw new TradeError("Enter a share amount greater than zero.");
  }

  const character = getCharacter(characterId);
  if (!character) throw new TradeError("That character isn't listed.");

  if (shares > character.shares_outstanding * MAX_TRADE_PCT_OF_FLOAT) {
    throw new TradeError(
      `Single orders are capped at ${Math.floor(
        character.shares_outstanding * MAX_TRADE_PCT_OF_FLOAT
      )} shares for this stock, to keep one trade from rugging the price.`
    );
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as
    | { id: string; balance: number }
    | undefined;
  if (!user) throw new TradeError("User not found.");

  const impact = priceImpact(character.price, shares, character.shares_outstanding);
  const avgFillPrice =
    side === "buy" ? character.price + impact / 2 : character.price - impact / 2;
  const total = avgFillPrice * shares;

  const holding = db
    .prepare("SELECT * FROM holdings WHERE user_id = ? AND character_id = ?")
    .get(userId, characterId) as { shares: number; cost_basis: number } | undefined;

  if (side === "buy") {
    if (user.balance < total) {
      throw new TradeError("Not enough souls for that order.");
    }
  } else {
    if (!holding || holding.shares < shares) {
      throw new TradeError("You don't own that many shares to sell.");
    }
  }

  const newPrice = Math.max(
    MIN_PRICE,
    side === "buy" ? character.price + impact : character.price - impact
  );

  const runTrade = db.transaction(() => {
    if (side === "buy") {
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(total, userId);
      if (holding) {
        db.prepare(
          "UPDATE holdings SET shares = shares + ?, cost_basis = cost_basis + ? WHERE user_id = ? AND character_id = ?"
        ).run(shares, total, userId, characterId);
      } else {
        db.prepare(
          "INSERT INTO holdings (user_id, character_id, shares, cost_basis) VALUES (?, ?, ?, ?)"
        ).run(userId, characterId, shares, total);
      }
    } else {
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(total, userId);
      const soldFraction = shares / holding!.shares;
      const basisRemoved = holding!.cost_basis * soldFraction;
      db.prepare(
        "UPDATE holdings SET shares = shares - ?, cost_basis = cost_basis - ? WHERE user_id = ? AND character_id = ?"
      ).run(shares, basisRemoved, userId, characterId);
    }

    db.prepare("UPDATE characters SET price = ? WHERE id = ?").run(newPrice, characterId);
    db.prepare("INSERT INTO price_history (character_id, price) VALUES (?, ?)").run(
      characterId,
      newPrice
    );
    db.prepare(
      "INSERT INTO transactions (user_id, character_id, side, shares, price, total) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(userId, characterId, side, shares, avgFillPrice, total);
  });

  runTrade();

  return { fillPrice: avgFillPrice, total, newPrice };
}
