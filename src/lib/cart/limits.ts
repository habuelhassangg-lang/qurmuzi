/**
 * Cart limits, shared by the client cart and the server schema. Kept free of
 * imports so the client bundle doesn't pull in Zod just for two numbers.
 */
export const MAX_LINE_QUANTITY = 10;
export const MAX_CART_LINES = 20;
