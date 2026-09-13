/* Defining a "Character" , roles like Tank,M1,Support,Flex etc, price ,*/
/*outstanding shares is the total number of shares that exist for that character */
export type Character = {
    id: string;
    name: string;
    role: string;
    image_url: string;
    price: number;
    shares_outstanding: number;
    created_at: string;
};

export type CharacterWithChange = Character & {
    change_pct: number;
    open_price: number;
};

export type Holding = {
    user_id: string;
    character_id: string;
    shares: number;
    cost_basis: number;
};      

export type PricePoint = {
    character_id: string;
    price: number;
    ts: string;
};

export type Transaction = {
    id: number;
    user_id: string;        
    character_id: string;
    side: "buy" | "sell";
    shares: number;
    price: number;
    total: number;
    created_at: string;
};

export type User = {
    id: string;
    handle: string;
    balance: number;
    created_at: string;
};
