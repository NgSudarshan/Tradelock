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

export type CharacterWithChange = Character & { /*This will calculate the price change % and contains the starting price*/
    change_pct: number;
    open_price: number;
};

export type Holding = { /*This will contain the user_id, character_id, no. of shares and cost basis for that character */
    user_id: string;
    character_id: string;
    shares: number;
    cost_basis: number;
};      

export type PricePoint = { /*This will contain the character_id, price and timestamp for that price point */
    character_id: string;
    price: number;
    ts: string;/*short for timestamp, this will be used to track the price changes over time for each character */
};

export type Transaction = { /*This will contain the transaction details for each buy/sell order */
    id: number;
    user_id: string;        
    character_id: string;
    side: "buy" | "sell";
    shares: number;
    price: number;
    total: number;
    created_at: string;
};

export type User = { /*This will contain the user details like id, handle, balance and created_at timestamp */
    id: string;
    handle: string;
    balance: number;
    created_at: string;
};
