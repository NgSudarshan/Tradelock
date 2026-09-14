import db from "./db";
import { Character, CharacterWithChange } from "./types";

export function getCharactersWithChange(): CharacterWithChange[] {
  const characters = db
    .prepare("SELECT * FROM characters ORDER BY price DESC")
    .all() as Character[];

  return characters.map((c) => {
    const oldest = db
      .prepare(
        "SELECT price FROM price_history WHERE character_id = ? ORDER BY ts ASC LIMIT 1"
      )
      .get(c.id) as { price: number } | undefined;
    const openPrice = oldest?.price ?? c.price;
    const change_pct = openPrice > 0 ? ((c.price - openPrice) / openPrice) * 100 : 0;
    return { ...c, open_price: openPrice, change_pct };
  });
}