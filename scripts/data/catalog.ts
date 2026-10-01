/**
 * Seed catalog. Prices are VAT-inclusive SAR for the "regular" size;
 * large and luxury are derived (see `variantPrices`). Copy follows the
 * "اللغة البيضاء" voice in CLAUDE.md section 5.
 */

export type SeedCategory = { slug: string; ar: string; en: string };
export type SeedOccasion = {
  slug: string;
  ar: string;
  en: string;
  descriptionAr: string;
  descriptionEn: string;
  date?: {
    calendar: "gregory" | "islamic-umalqura";
    month: number;
    day: number;
    durationDays: number;
  };
};
export type SeedProduct = {
  slug: string;
  category: string;
  ar: string;
  en: string;
  descriptionAr: string;
  descriptionEn: string;
  color: string;
  flowerType: string;
  /** Regular size price in whole SAR, VAT-inclusive. */
  price: number;
  occasions: string[];
  /** Days ago the product was "added" (drives the newest sort). */
  addedDaysAgo: number;
};

export const CATEGORIES: SeedCategory[] = [
  { slug: "bouquets", ar: "بوكيهات", en: "Bouquets" },
  { slug: "boxes", ar: "بوكس ورد", en: "Flower boxes" },
  { slug: "vases", ar: "تنسيقات في فازة", en: "Vase arrangements" },
  { slug: "baskets", ar: "سلال", en: "Baskets" },
];

export const OCCASIONS: SeedOccasion[] = [
  {
    slug: "love",
    ar: "حب",
    en: "Love",
    descriptionAr: "قلها بالورد، بدون ما تقول كلمة.",
    descriptionEn: "Say it with flowers, no words needed.",
  },
  {
    slug: "birthday",
    ar: "عيد ميلاد",
    en: "Birthday",
    descriptionAr: "ورد يفرّح صاحب المناسبة.",
    descriptionEn: "Flowers that make their day.",
  },
  {
    slug: "new-baby",
    ar: "مواليد",
    en: "New baby",
    descriptionAr: "تنسيقات مناسبة للمستشفى ترحّب بالمولود الجديد.",
    descriptionEn: "Hospital-friendly arrangements to welcome the new baby.",
  },
  {
    slug: "graduation",
    ar: "تخرج",
    en: "Graduation",
    descriptionAr: "احتفل بإنجازهم بباقة تليق بهم.",
    descriptionEn: "Celebrate their achievement with flowers to match.",
  },
  {
    slug: "wedding",
    ar: "زواج وملكة",
    en: "Weddings & malka",
    descriptionAr: "ورد فاخر لليلة العمر.",
    descriptionEn: "Luxurious flowers for the big night.",
  },
  {
    slug: "get-well",
    ar: "سلامتك",
    en: "Get well",
    descriptionAr: "ورد هادئ يقول: ما تشوف شر.",
    descriptionEn: "Calm flowers to wish a speedy recovery.",
  },
  {
    slug: "apology",
    ar: "اعتذار",
    en: "Apology",
    descriptionAr: "أحيانًا الورد يعتذر أحسن منا.",
    descriptionEn: "Sometimes flowers apologize better than we do.",
  },
  {
    slug: "ramadan",
    ar: "رمضان",
    en: "Ramadan",
    descriptionAr: "هدايا رمضانية لمن تحب.",
    descriptionEn: "Ramadan gifts for the people you love.",
    date: { calendar: "islamic-umalqura", month: 9, day: 1, durationDays: 30 },
  },
  {
    slug: "eid-al-fitr",
    ar: "عيد الفطر",
    en: "Eid al-Fitr",
    descriptionAr: "عيدكم مبارك، والورد علينا.",
    descriptionEn: "Eid Mubarak, the flowers are on us.",
    date: { calendar: "islamic-umalqura", month: 10, day: 1, durationDays: 3 },
  },
  {
    slug: "eid-al-adha",
    ar: "عيد الأضحى",
    en: "Eid al-Adha",
    descriptionAr: "فرحة العيد تكمل بالورد.",
    descriptionEn: "Flowers to complete the joy of Eid.",
    date: { calendar: "islamic-umalqura", month: 12, day: 10, durationDays: 4 },
  },
  {
    slug: "founding-day",
    ar: "يوم التأسيس",
    en: "Founding Day",
    descriptionAr: "نحتفل بيوم بدينا.",
    descriptionEn: "Celebrating the day it all began.",
    date: { calendar: "gregory", month: 2, day: 22, durationDays: 1 },
  },
  {
    slug: "national-day",
    ar: "اليوم الوطني",
    en: "National Day",
    descriptionAr: "ورد أخضر يحتفل بالوطن.",
    descriptionEn: "Green flowers to celebrate the Kingdom.",
    date: { calendar: "gregory", month: 9, day: 23, durationDays: 1 },
  },
];

export const PRODUCTS: SeedProduct[] = [
  {
    slug: "crimson-classic",
    category: "bouquets",
    ar: "قرمزي الكلاسيكي",
    en: "Crimson Classic",
    descriptionAr:
      "ورد جوري أحمر مختار بعناية، ملفوف بورق كريمي وشريطة قرمزية.",
    descriptionEn:
      "Hand-picked red roses wrapped in cream paper with a crimson ribbon.",
    color: "red",
    flowerType: "rose",
    price: 249,
    occasions: ["love", "apology", "birthday"],
    addedDaysAgo: 40,
  },
  {
    slug: "white-calm",
    category: "bouquets",
    ar: "هدوء أبيض",
    en: "White Calm",
    descriptionAr: "زنابق بيضاء مع أوراق خضراء، لمسة هادئة تناسب الزيارات.",
    descriptionEn: "White lilies with fresh greenery, a calm touch for visits.",
    color: "white",
    flowerType: "lily",
    price: 219,
    occasions: ["get-well", "apology", "ramadan"],
    addedDaysAgo: 35,
  },
  {
    slug: "pink-dawn",
    category: "bouquets",
    ar: "فجر وردي",
    en: "Pink Dawn",
    descriptionAr: "ورد وردي ناعم مع جبسوفيلا، باقة خفيفة تفرّح القلب.",
    descriptionEn:
      "Soft pink roses with baby's breath, a light bouquet that lifts the mood.",
    color: "pink",
    flowerType: "rose",
    price: 189,
    occasions: ["birthday", "love", "new-baby"],
    addedDaysAgo: 30,
  },
  {
    slug: "baby-blue-basket",
    category: "baskets",
    ar: "سلة المولود الأزرق",
    en: "Baby Blue Basket",
    descriptionAr: "سلة هيدرانجا زرقاء وورد أبيض، مناسبة لغرف المستشفى.",
    descriptionEn:
      "Blue hydrangea and white roses in a basket, made for hospital rooms.",
    color: "blue",
    flowerType: "hydrangea",
    price: 329,
    occasions: ["new-baby"],
    addedDaysAgo: 28,
  },
  {
    slug: "baby-pink-basket",
    category: "baskets",
    ar: "سلة المولودة الوردية",
    en: "Baby Pink Basket",
    descriptionAr: "سلة ورد وردي وهيدرانجا فاتحة، ترحيب لطيف بالمولودة.",
    descriptionEn:
      "Pink roses and pale hydrangea in a basket, a gentle welcome for a baby girl.",
    color: "pink",
    flowerType: "hydrangea",
    price: 329,
    occasions: ["new-baby"],
    addedDaysAgo: 27,
  },
  {
    slug: "founding-salute",
    category: "boxes",
    ar: "تحية التأسيس",
    en: "Founding Salute",
    descriptionAr: "بوكس ورد بألوان يوم التأسيس، بني دافئ وأخضر وذهبي.",
    descriptionEn:
      "A flower box in Founding Day colors: warm brown, green and gold.",
    color: "green",
    flowerType: "mixed",
    price: 279,
    occasions: ["founding-day"],
    addedDaysAgo: 25,
  },
  {
    slug: "green-homeland",
    category: "boxes",
    ar: "أخضر الوطن",
    en: "Green Homeland",
    descriptionAr:
      "ورد أبيض مع لمسات خضراء في بوكس أنيق للاحتفال باليوم الوطني.",
    descriptionEn:
      "White roses with green accents in an elegant box for National Day.",
    color: "green",
    flowerType: "rose",
    price: 279,
    occasions: ["national-day"],
    addedDaysAgo: 8,
  },
  {
    slug: "eid-joy",
    category: "boxes",
    ar: "فرحة العيد",
    en: "Eid Joy",
    descriptionAr: "بوكس ملوّن مليان فرح، هدية العيد اللي تنتظرها العائلة.",
    descriptionEn:
      "A colorful box full of joy, the Eid gift the whole family looks forward to.",
    color: "mixed",
    flowerType: "mixed",
    price: 299,
    occasions: ["eid-al-fitr", "eid-al-adha"],
    addedDaysAgo: 20,
  },
  {
    slug: "ramadan-glow",
    category: "vases",
    ar: "نور رمضان",
    en: "Ramadan Glow",
    descriptionAr: "ورد أبيض ولمسة ذهبية في فازة، تزيّن سفرة الإفطار.",
    descriptionEn:
      "White flowers with a golden touch in a vase, made for the iftar table.",
    color: "white",
    flowerType: "rose",
    price: 259,
    occasions: ["ramadan"],
    addedDaysAgo: 18,
  },
  {
    slug: "graduation-sun",
    category: "bouquets",
    ar: "شمس التخرج",
    en: "Graduation Sun",
    descriptionAr: "عباد شمس مشرق، باقة تحتفل بالبدايات الجديدة.",
    descriptionEn:
      "Bright sunflowers, a bouquet that celebrates new beginnings.",
    color: "yellow",
    flowerType: "sunflower",
    price: 169,
    occasions: ["graduation", "birthday"],
    addedDaysAgo: 15,
  },
  {
    slug: "malka-night",
    category: "vases",
    ar: "ليلة الملكة",
    en: "Malka Night",
    descriptionAr: "فاوانيا بيضاء وورد كريمي في فازة فاخرة، تليق بليلة الملكة.",
    descriptionEn:
      "White peonies and cream roses in a luxury vase, made for the malka night.",
    color: "white",
    flowerType: "peony",
    price: 549,
    occasions: ["wedding"],
    addedDaysAgo: 12,
  },
  {
    slug: "tulip-garden",
    category: "vases",
    ar: "حديقة التوليب",
    en: "Tulip Garden",
    descriptionAr: "توليب بنفسجي في فازة زجاج، ربيع صغير على الطاولة.",
    descriptionEn:
      "Purple tulips in a glass vase, a little spring on the table.",
    color: "purple",
    flowerType: "tulip",
    price: 389,
    occasions: ["birthday", "love", "get-well"],
    addedDaysAgo: 6,
  },
  {
    slug: "elegant-orchid",
    category: "vases",
    ar: "أوركيد أنيق",
    en: "Elegant Orchid",
    descriptionAr: "نبتة أوركيد بنفسجية تعيش أسابيع، هدية تبقى.",
    descriptionEn:
      "A purple orchid plant that lasts for weeks, a gift that stays.",
    color: "purple",
    flowerType: "orchid",
    price: 449,
    occasions: ["get-well", "apology", "graduation"],
    addedDaysAgo: 4,
  },
  {
    slug: "grand-love-box",
    category: "boxes",
    ar: "بوكس الحب الكبير",
    en: "Grand Love Box",
    descriptionAr:
      "خمسين وردة جوري حمراء في بوكس فاخر، لما تبي تقولها بصوت عالي.",
    descriptionEn:
      "Fifty red roses in a luxury box, for when you want to say it loud.",
    color: "red",
    flowerType: "rose",
    price: 749,
    occasions: ["love", "wedding"],
    addedDaysAgo: 2,
  },
  {
    slug: "lavender-whisper",
    category: "bouquets",
    ar: "همسة لافندر",
    en: "Lavender Whisper",
    descriptionAr: "لافندر وورد بنفسجي فاتح، باقة صغيرة بمعنى كبير.",
    descriptionEn:
      "Lavender and pale purple roses, a small bouquet with a big meaning.",
    color: "purple",
    flowerType: "lavender",
    price: 149,
    occasions: ["apology", "get-well"],
    addedDaysAgo: 1,
  },
];

/** Large = +40%, luxury = +100%, rounded up to end in 9 riyals. */
export function variantPrices(regularSar: number) {
  const roundTo9 = (n: number) => Math.ceil((n + 1) / 10) * 10 - 1;
  return {
    regular: regularSar * 100,
    large: roundTo9(regularSar * 1.4) * 100,
    luxury: roundTo9(regularSar * 2) * 100,
  };
}

export const ADD_ONS = [
  {
    slug: "chocolate",
    ar: "شوكولاتة فاخرة",
    en: "Luxury chocolate",
    price: 59,
  },
  { slug: "vase", ar: "فازة زجاج", en: "Glass vase", price: 79 },
  { slug: "balloon", ar: "بالون تهنئة", en: "Celebration balloon", price: 35 },
  { slug: "teddy", ar: "دبدوب صغير", en: "Small teddy bear", price: 69 },
];

export const CITIES = [
  {
    slug: "riyadh",
    ar: "الرياض",
    en: "Riyadh",
    districts: [
      { slug: "olaya", ar: "العليا", en: "Al Olaya", fee: 25 },
      { slug: "malqa", ar: "الملقا", en: "Al Malqa", fee: 25 },
      { slug: "narjis", ar: "النرجس", en: "An Narjis", fee: 30 },
      { slug: "yasmin", ar: "الياسمين", en: "Al Yasmin", fee: 25 },
      { slug: "hittin", ar: "حطين", en: "Hittin", fee: 30 },
      {
        slug: "sulaimaniyah",
        ar: "السليمانية",
        en: "As Sulaimaniyah",
        fee: 25,
      },
    ],
  },
  {
    slug: "jeddah",
    ar: "جدة",
    en: "Jeddah",
    districts: [
      { slug: "rawdah", ar: "الروضة", en: "Ar Rawdah", fee: 25 },
      { slug: "shati", ar: "الشاطئ", en: "Ash Shati", fee: 30 },
      { slug: "hamra", ar: "الحمراء", en: "Al Hamra", fee: 25 },
      { slug: "salamah", ar: "السلامة", en: "As Salamah", fee: 25 },
      { slug: "naeem", ar: "النعيم", en: "An Naeem", fee: 30 },
      { slug: "zahra", ar: "الزهراء", en: "Az Zahra", fee: 25 },
    ],
  },
  {
    slug: "dammam",
    ar: "الدمام",
    en: "Dammam",
    districts: [
      { slug: "faisaliyah", ar: "الفيصلية", en: "Al Faisaliyah", fee: 30 },
      { slug: "shati", ar: "الشاطئ", en: "Ash Shati", fee: 30 },
      { slug: "rayyan", ar: "الريان", en: "Ar Rayyan", fee: 30 },
      { slug: "nuzhah", ar: "النزهة", en: "An Nuzhah", fee: 30 },
      { slug: "mazruiyah", ar: "المزروعية", en: "Al Mazruiyah", fee: 35 },
    ],
  },
];

const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7];
const NOT_FRIDAY = [1, 2, 3, 4, 6, 7];

/** Friday deliveries start after midday. Capacity is per slot per day. */
export const DELIVERY_SLOTS = [
  { startsAt: "09:00", endsAt: "12:00", weekdays: NOT_FRIDAY, capacity: 8 },
  { startsAt: "12:00", endsAt: "15:00", weekdays: NOT_FRIDAY, capacity: 8 },
  { startsAt: "15:00", endsAt: "18:00", weekdays: ALL_DAYS, capacity: 10 },
  { startsAt: "18:00", endsAt: "21:00", weekdays: ALL_DAYS, capacity: 10 },
];

export const SETTINGS = {
  same_day_cutoff_hour: 14,
  capacity_days_ahead: 30,
  gift_message_max_length: 200,
  /** Hours between ordering and the start of a same-day slot. */
  same_day_prep_hours: 2,
  /** How many days ahead customers can pick a delivery date. */
  delivery_days_ahead: 14,
  /** Dummy VAT registration number shown on invoices (demo only). */
  vat_number: "300000000000003",
  seller_name_ar: "قُرمُزي (متجر تجريبي)",
  seller_name_en: "Qurmuzi (demo store)",
  /** Product slugs shown in "featured" on the home page, in order. */
  featured_products: [
    "crimson-classic",
    "tulip-garden",
    "baby-pink-basket",
    "graduation-sun",
  ],
};

/** Images per product (placeholders until real photos are added). */
export const IMAGES_PER_PRODUCT = 2;
