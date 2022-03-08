export interface Animat3D {

    /** User VIP */
    vip: boolean;
    /** User Coins */
    coins: number;
    /** User Unlock */
    unlocks: string;

    /** Items Array */
    items: object;
    /** Items to buy Array */
    buy: object;

    /** Item ID */
    id: number;
    /** Item Base Name */
    name: string;
    /** German Item Display Name */
    name_de: string;
    /** English Item Display Name */
    name_en: string;
    /** German Item Description */
    desc_de: string;
    /** English Item Description */
    desc_en: string;
    /** Item Category */
    category: string;
    /** Item Rarity */
    grade: number;
    /** Item icon path */
    icon: string;
    /** Item shop price */
    price: number;

    /** Is item obtainable? */
    obtainable: number;
    /** Is item tradable? */
    tradable: number;
    /** Is item dyeable? */
    dyeable: number;

    /** Item restricted to class */
    classes: string;
    /** Item restricted to gender */
    gender: string;
    /** Item restricted to level */
    level: number;
    /** Item restricted to races */
    races: string;
    /** Item restricted to skill */
    skill: number;

}

export {};
