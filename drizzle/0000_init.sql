CREATE TYPE "public"."occasion_calendar" AS ENUM('gregory', 'islamic-umalqura');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('confirmed', 'preparing', 'photo_sent', 'out_for_delivery', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('mada', 'apple_pay', 'stc_pay', 'tabby', 'tamara', 'cash_on_delivery');--> statement-breakpoint
CREATE TYPE "public"."product_size" AS ENUM('regular', 'large', 'luxury');--> statement-breakpoint
CREATE TABLE "add_ons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "add_ons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"price_halalas" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "add_ons_slug_unique" UNIQUE("slug"),
	CONSTRAINT "add_ons_price_positive" CHECK ("add_ons"."price_halalas" > 0)
);
--> statement-breakpoint
CREATE TABLE "blackout_dates" (
	"date" date PRIMARY KEY NOT NULL,
	"reason_ar" text,
	"reason_en" text
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "cities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "daily_capacity" (
	"date" date NOT NULL,
	"slot_id" integer NOT NULL,
	"capacity" smallint NOT NULL,
	"reserved" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "daily_capacity_date_slot_id_pk" PRIMARY KEY("date","slot_id"),
	CONSTRAINT "daily_capacity_within_limit" CHECK ("daily_capacity"."reserved" >= 0 AND "daily_capacity"."reserved" <= "daily_capacity"."capacity")
);
--> statement-breakpoint
CREATE TABLE "delivery_slots" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "delivery_slots_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"starts_at" time NOT NULL,
	"ends_at" time NOT NULL,
	"weekdays" smallint[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "districts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"city_id" integer NOT NULL,
	"slug" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"delivery_fee_halalas" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "districts_fee_non_negative" CHECK ("districts"."delivery_fee_halalas" >= 0)
);
--> statement-breakpoint
CREATE TABLE "occasions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "occasions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"description_ar" text,
	"description_en" text,
	"calendar" "occasion_calendar",
	"month" smallint,
	"day" smallint,
	"duration_days" smallint,
	"sort_order" smallint DEFAULT 0 NOT NULL,
	CONSTRAINT "occasions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" uuid NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"quantity" smallint NOT NULL,
	"unit_price_halalas" integer NOT NULL,
	"snapshot" jsonb NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_status_history_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" uuid NOT NULL,
	"status" "order_status" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"status" "order_status" DEFAULT 'confirmed' NOT NULL,
	"locale" text NOT NULL,
	"user_id" text,
	"buyer_name" text NOT NULL,
	"buyer_phone" text NOT NULL,
	"buyer_email" text NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_phone" text NOT NULL,
	"city_id" integer NOT NULL,
	"district_id" integer NOT NULL,
	"address_line" text NOT NULL,
	"national_address_code" text,
	"delivery_date" date NOT NULL,
	"slot_id" integer NOT NULL,
	"gift_message" text,
	"hide_price" boolean DEFAULT false NOT NULL,
	"anonymous_sender" boolean DEFAULT false NOT NULL,
	"surprise" boolean DEFAULT false NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"subtotal_halalas" integer NOT NULL,
	"delivery_fee_halalas" integer NOT NULL,
	"coupon_code" text,
	"discount_halalas" integer DEFAULT 0 NOT NULL,
	"total_halalas" integer NOT NULL,
	"vat_halalas" integer NOT NULL,
	"utm_first" jsonb,
	"utm_last" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_images_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_id" integer NOT NULL,
	"path" text NOT NULL,
	"alt_ar" text NOT NULL,
	"alt_en" text NOT NULL,
	"photographer" text,
	"photographer_url" text,
	"source_url" text,
	"sort_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_occasions" (
	"product_id" integer NOT NULL,
	"occasion_id" integer NOT NULL,
	CONSTRAINT "product_occasions_product_id_occasion_id_pk" PRIMARY KEY("product_id","occasion_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"category_id" integer NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"description_ar" text NOT NULL,
	"description_en" text NOT NULL,
	"color" text NOT NULL,
	"flower_type" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "variants_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_id" integer NOT NULL,
	"size" "product_size" NOT NULL,
	"price_halalas" integer NOT NULL,
	CONSTRAINT "variants_price_positive" CHECK ("variants"."price_halalas" > 0)
);
--> statement-breakpoint
ALTER TABLE "daily_capacity" ADD CONSTRAINT "daily_capacity_slot_id_delivery_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."delivery_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_slot_id_delivery_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."delivery_slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_occasions" ADD CONSTRAINT "product_occasions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_occasions" ADD CONSTRAINT "product_occasions_occasion_id_occasions_id_fk" FOREIGN KEY ("occasion_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "districts_city_slug_idx" ON "districts" USING btree ("city_id","slug");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_status_history_order_idx" ON "order_status_history" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_occasions_occasion_idx" ON "product_occasions" USING btree ("occasion_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "variants_product_size_idx" ON "variants" USING btree ("product_id","size");