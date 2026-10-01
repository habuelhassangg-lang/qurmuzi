import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ───────────── Enums ───────────── */

/** Full lifecycle exists from M2; only `confirmed` is used in the MVP. */
export const orderStatus = pgEnum("order_status", [
  "confirmed",
  "preparing",
  "photo_sent",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const productSize = pgEnum("product_size", [
  "regular",
  "large",
  "luxury",
]);

export const paymentMethod = pgEnum("payment_method", [
  "mada",
  "apple_pay",
  "stc_pay",
  "tabby",
  "tamara",
  "cash_on_delivery",
]);

/** Calendar used by an occasion's recurring date. */
export const occasionCalendar = pgEnum("occasion_calendar", [
  "gregory",
  "islamic-umalqura",
]);

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/* ───────────── Catalog ───────────── */

export const categories = pgTable("categories", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: text().notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  sortOrder: smallint("sort_order").notNull().default(0),
});

export const occasions = pgTable("occasions", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: text().notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  // 🪝 Seasonal pages (L5): a recurring date in either calendar. Null for
  // occasions without a date (birthdays, get well...).
  calendar: occasionCalendar(),
  month: smallint(),
  day: smallint(),
  durationDays: smallint("duration_days"),
  sortOrder: smallint("sort_order").notNull().default(0),
});

export const products = pgTable(
  "products",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: text().notNull().unique(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    descriptionAr: text("description_ar").notNull(),
    descriptionEn: text("description_en").notNull(),
    // 🪝 Color and flower-type filters (L2): stored and seeded now.
    color: text().notNull(),
    flowerType: text("flower_type").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("products_category_idx").on(t.categoryId)],
);

export const productOccasions = pgTable(
  "product_occasions",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    occasionId: integer("occasion_id")
      .notNull()
      .references(() => occasions.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.occasionId] }),
    index("product_occasions_occasion_idx").on(t.occasionId),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    /** Base path without extension, e.g. `/images/products/red-roses-1`. */
    path: text().notNull(),
    altAr: text("alt_ar").notNull(),
    altEn: text("alt_en").notNull(),
    photographer: text(),
    photographerUrl: text("photographer_url"),
    sourceUrl: text("source_url"),
    sortOrder: smallint("sort_order").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const variants = pgTable(
  "variants",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: productSize().notNull(),
    priceHalalas: integer("price_halalas").notNull(),
  },
  (t) => [
    uniqueIndex("variants_product_size_idx").on(t.productId, t.size),
    check("variants_price_positive", sql`${t.priceHalalas} > 0`),
  ],
);

export const addOns = pgTable(
  "add_ons",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    slug: text().notNull().unique(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    priceHalalas: integer("price_halalas").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: smallint("sort_order").notNull().default(0),
  },
  (t) => [check("add_ons_price_positive", sql`${t.priceHalalas} > 0`)],
);

/* ───────────── Delivery (operational config lives in tables, not code) ───────────── */

export const cities = pgTable("cities", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: text().notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: smallint("sort_order").notNull().default(0),
});

export const districts = pgTable(
  "districts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    cityId: integer("city_id")
      .notNull()
      .references(() => cities.id),
    slug: text().notNull(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    deliveryFeeHalalas: integer("delivery_fee_halalas").notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    uniqueIndex("districts_city_slug_idx").on(t.cityId, t.slug),
    check("districts_fee_non_negative", sql`${t.deliveryFeeHalalas} >= 0`),
  ],
);

export const deliverySlots = pgTable("delivery_slots", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  /** Local Riyadh time. */
  startsAt: time("starts_at").notNull(),
  endsAt: time("ends_at").notNull(),
  /** ISO weekdays (1 = Monday … 7 = Sunday) the slot runs on; Fri = 5, Sat = 6. */
  weekdays: smallint().array().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: smallint("sort_order").notNull().default(0),
});

export const dailyCapacity = pgTable(
  "daily_capacity",
  {
    date: date({ mode: "string" }).notNull(),
    slotId: integer("slot_id")
      .notNull()
      .references(() => deliverySlots.id),
    capacity: smallint().notNull(),
    reserved: smallint().notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.date, t.slotId] }),
    check(
      "daily_capacity_within_limit",
      sql`${t.reserved} >= 0 AND ${t.reserved} <= ${t.capacity}`,
    ),
  ],
);

export const blackoutDates = pgTable("blackout_dates", {
  date: date({ mode: "string" }).primaryKey(),
  reasonAr: text("reason_ar"),
  reasonEn: text("reason_en"),
});

/** Key/value operational settings, e.g. `same_day_cutoff_hour`. */
export const settings = pgTable("settings", {
  key: text().primaryKey(),
  value: jsonb().notNull(),
});

/* ───────────── Orders ───────────── */

export const orders = pgTable(
  "orders",
  {
    id: uuid().primaryKey().defaultRandom(),
    orderNumber: text("order_number").notNull().unique(),
    status: orderStatus().notNull().default("confirmed"),
    locale: text().notNull(),
    // 🪝 Accounts (L3): guest orders have no user.
    userId: text("user_id"),

    buyerName: text("buyer_name").notNull(),
    buyerPhone: text("buyer_phone").notNull(),
    buyerEmail: text("buyer_email").notNull(),

    recipientName: text("recipient_name").notNull(),
    recipientPhone: text("recipient_phone").notNull(),
    cityId: integer("city_id")
      .notNull()
      .references(() => cities.id),
    districtId: integer("district_id")
      .notNull()
      .references(() => districts.id),
    addressLine: text("address_line").notNull(),
    nationalAddressCode: text("national_address_code"),
    deliveryDate: date("delivery_date", { mode: "string" }).notNull(),
    slotId: integer("slot_id")
      .notNull()
      .references(() => deliverySlots.id),

    giftMessage: text("gift_message"),
    hidePrice: boolean("hide_price").notNull().default(false),
    anonymousSender: boolean("anonymous_sender").notNull().default(false),
    surprise: boolean().notNull().default(false),

    paymentMethod: paymentMethod("payment_method").notNull(),
    subtotalHalalas: integer("subtotal_halalas").notNull(),
    deliveryFeeHalalas: integer("delivery_fee_halalas").notNull(),
    // 🪝 Coupons (L5)
    couponCode: text("coupon_code"),
    discountHalalas: integer("discount_halalas").notNull().default(0),
    totalHalalas: integer("total_halalas").notNull(),
    vatHalalas: integer("vat_halalas").notNull(),

    // 🪝 UTM capture (L5)
    utmFirst: jsonb("utm_first"),
    utmLast: jsonb("utm_last"),

    createdAt: createdAt(),
  },
  (t) => [index("orders_created_at_idx").on(t.createdAt)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    variantId: integer("variant_id")
      .notNull()
      .references(() => variants.id),
    quantity: smallint().notNull(),
    unitPriceHalalas: integer("unit_price_halalas").notNull(),
    /** Snapshot of names and add-ons at order time, so later edits don't change old orders. */
    snapshot: jsonb().notNull(),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    check("order_items_quantity_positive", sql`${t.quantity} > 0`),
  ],
);

// 🪝 Order tracking (L3) and admin status changes (L4).
export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: orderStatus().notNull(),
    note: text(),
    createdAt: createdAt(),
  },
  (t) => [index("order_status_history_order_idx").on(t.orderId)],
);
