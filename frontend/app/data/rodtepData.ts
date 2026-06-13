export interface RodtepEntry {
  id: string;
  chapter: number;
  chapterTitle: string;
  description: string;
  hsCode?: string;
  rodtepMin: number;
  rodtepMax: number;
  drawbackAIR?: number;
  drawbackAIRMax?: number;
  unit: string;
  notes?: string;
  tags: string[];
}

export const RODTEP_DATA: RodtepEntry[] = [
  // ── Textiles & Apparel ────────────────────────────────────
  { id: "52-01", chapter: 52, chapterTitle: "Cotton", description: "Cotton yarn (not retail)", hsCode: "5205–5207", rodtepMin: 2.5, rodtepMax: 5.5, drawbackAIR: 3.2, unit: "kg", tags: ["cotton", "yarn", "textiles"] },
  { id: "52-02", chapter: 52, chapterTitle: "Cotton", description: "Cotton woven fabrics", hsCode: "5208–5212", rodtepMin: 3.0, rodtepMax: 5.0, drawbackAIR: 3.5, unit: "kg", tags: ["cotton", "fabric", "textiles"] },
  { id: "54-01", chapter: 54, chapterTitle: "Man-made filaments", description: "Polyester/nylon yarn and filaments", hsCode: "5401–5408", rodtepMin: 2.5, rodtepMax: 4.5, drawbackAIR: 2.8, unit: "kg", tags: ["polyester", "nylon", "yarn", "mmf", "textiles"] },
  { id: "55-01", chapter: 55, chapterTitle: "Man-made staple fibres", description: "Polyester staple fibre (PSF), viscose", hsCode: "5501–5516", rodtepMin: 2.0, rodtepMax: 4.0, drawbackAIR: 2.5, unit: "kg", tags: ["psf", "viscose", "fibre", "textiles"] },
  { id: "60-01", chapter: 60, chapterTitle: "Knitted fabrics", description: "Knitted/crocheted fabrics", hsCode: "6001–6006", rodtepMin: 2.5, rodtepMax: 4.0, drawbackAIR: 3.0, unit: "kg", tags: ["knitted", "fabric", "textiles"] },
  { id: "61-01", chapter: 61, chapterTitle: "Knitted apparel", description: "T-shirts, jerseys, pullovers (knitted)", hsCode: "6101–6117", rodtepMin: 3.8, rodtepMax: 4.3, drawbackAIR: 4.5, unit: "piece", notes: "Highest RoDTEP rates in garments", tags: ["tshirt", "garment", "apparel", "knitted", "clothing"] },
  { id: "62-01", chapter: 62, chapterTitle: "Woven apparel", description: "Shirts, trousers, jackets, suits (woven)", hsCode: "6201–6217", rodtepMin: 3.8, rodtepMax: 4.8, drawbackAIR: 4.5, unit: "piece", tags: ["shirt", "trousers", "jacket", "apparel", "garment", "woven", "clothing"] },
  { id: "63-01", chapter: 63, chapterTitle: "Made-ups & home textiles", description: "Bed linen, towels, curtains, bags", hsCode: "6301–6310", rodtepMin: 3.0, rodtepMax: 4.5, drawbackAIR: 3.8, unit: "kg", tags: ["bedsheet", "towel", "home textile", "made-ups", "linen"] },
  // ── Leather & Footwear ────────────────────────────────────
  { id: "41-01", chapter: 41, chapterTitle: "Hides, skins and leather", description: "Finished leather, crust leather", hsCode: "4101–4115", rodtepMin: 1.5, rodtepMax: 3.0, drawbackAIR: 2.5, unit: "sq ft", tags: ["leather", "hide", "crust"] },
  { id: "42-01", chapter: 42, chapterTitle: "Leather articles", description: "Handbags, wallets, belts, leather goods", hsCode: "4201–4205", rodtepMin: 2.0, rodtepMax: 3.5, drawbackAIR: 3.0, unit: "piece", tags: ["handbag", "wallet", "belt", "leather goods"] },
  { id: "64-01", chapter: 64, chapterTitle: "Footwear", description: "Leather footwear (shoes, sandals, boots)", hsCode: "6401–6406", rodtepMin: 2.0, rodtepMax: 3.5, drawbackAIR: 3.5, unit: "pair", tags: ["shoes", "sandals", "boots", "footwear"] },
  // ── Gems & Jewellery ─────────────────────────────────────
  { id: "71-01", chapter: 71, chapterTitle: "Gems & Jewellery", description: "Gold/silver jewellery (handcrafted)", hsCode: "7113–7118", rodtepMin: 0.5, rodtepMax: 1.5, drawbackAIR: 1.5, unit: "gm", notes: "Low rate; duty drawback on gold not available for replenishment license holders", tags: ["gold", "silver", "jewellery", "gems"] },
  { id: "71-02", chapter: 71, chapterTitle: "Gems & Jewellery", description: "Cut & polished diamonds, gemstones", hsCode: "7101–7104", rodtepMin: 0.5, rodtepMax: 1.0, drawbackAIR: 0.5, unit: "carat", tags: ["diamond", "gemstone", "polished", "gems"] },
  // ── Food & Agricultural Products ─────────────────────────
  { id: "03-01", chapter: 3, chapterTitle: "Fish & seafood", description: "Shrimp, prawn, fish fillets", hsCode: "0301–0307", rodtepMin: 3.2, rodtepMax: 4.4, drawbackAIR: 2.5, unit: "kg", tags: ["shrimp", "prawn", "fish", "seafood", "marine"] },
  { id: "08-01", chapter: 8, chapterTitle: "Fruits & nuts", description: "Fresh/dried mangoes, grapes, pomegranate", hsCode: "0801–0814", rodtepMin: 2.5, rodtepMax: 4.0, drawbackAIR: 2.0, unit: "kg", tags: ["mango", "grapes", "fruit", "agriculture"] },
  { id: "09-01", chapter: 9, chapterTitle: "Spices", description: "Pepper, cardamom, turmeric, chilli", hsCode: "0901–0910", rodtepMin: 2.5, rodtepMax: 3.5, drawbackAIR: 2.5, unit: "kg", tags: ["spices", "pepper", "cardamom", "turmeric", "chilli"] },
  { id: "10-01", chapter: 10, chapterTitle: "Cereals", description: "Basmati rice, non-basmati rice, wheat", hsCode: "1001–1008", rodtepMin: 2.5, rodtepMax: 3.5, drawbackAIR: 1.5, unit: "kg", tags: ["rice", "basmati", "wheat", "cereal", "agriculture"] },
  { id: "17-01", chapter: 17, chapterTitle: "Sugar & confectionery", description: "Raw sugar, refined sugar, molasses", hsCode: "1701–1703", rodtepMin: 1.5, rodtepMax: 3.0, drawbackAIR: 1.5, unit: "kg", tags: ["sugar", "molasses", "confectionery"] },
  { id: "19-01", chapter: 19, chapterTitle: "Food preparations", description: "Biscuits, snacks, pasta, cereal preparations", hsCode: "1901–1905", rodtepMin: 2.5, rodtepMax: 4.0, drawbackAIR: 3.0, unit: "kg", tags: ["biscuit", "snack", "pasta", "food", "fmcg"] },
  { id: "21-01", chapter: 21, chapterTitle: "Misc food preparations", description: "Sauces, seasonings, curry powder, extracts", hsCode: "2101–2106", rodtepMin: 2.5, rodtepMax: 3.5, drawbackAIR: 2.8, unit: "kg", tags: ["sauce", "seasoning", "curry", "food"] },
  { id: "24-01", chapter: 24, chapterTitle: "Tobacco", description: "Tobacco products, cigarettes", hsCode: "2401–2403", rodtepMin: 1.5, rodtepMax: 2.5, drawbackAIR: 1.0, unit: "kg", tags: ["tobacco", "cigarette"] },
  // ── Chemicals & Pharma ────────────────────────────────────
  { id: "29-01", chapter: 29, chapterTitle: "Organic chemicals", description: "Specialty chemicals, dye intermediates", hsCode: "2901–2942", rodtepMin: 1.0, rodtepMax: 2.5, drawbackAIR: 2.0, unit: "kg", tags: ["chemical", "organic", "dye", "intermediate"] },
  { id: "30-01", chapter: 30, chapterTitle: "Pharmaceutical products", description: "Tablets, capsules, API, formulations", hsCode: "3001–3006", rodtepMin: 0.5, rodtepMax: 1.5, drawbackAIR: 1.0, unit: "kg", notes: "Lower rates due to concessional duty structure on pharma inputs", tags: ["pharma", "medicine", "tablet", "api", "formulation"] },
  { id: "33-01", chapter: 33, chapterTitle: "Cosmetics & toiletries", description: "Soaps, shampoo, cosmetics, perfumes", hsCode: "3301–3307", rodtepMin: 2.5, rodtepMax: 3.5, drawbackAIR: 3.0, unit: "kg", tags: ["cosmetics", "soap", "shampoo", "perfume", "fmcg"] },
  // ── Plastics & Rubber ─────────────────────────────────────
  { id: "39-01", chapter: 39, chapterTitle: "Plastics", description: "Plastic articles, PET preforms, packaging", hsCode: "3901–3926", rodtepMin: 2.0, rodtepMax: 3.5, drawbackAIR: 2.5, unit: "kg", tags: ["plastic", "pet", "packaging"] },
  { id: "40-01", chapter: 40, chapterTitle: "Rubber & rubber articles", description: "Tyres, tubes, rubber gloves, rubber goods", hsCode: "4001–4017", rodtepMin: 2.0, rodtepMax: 3.0, drawbackAIR: 2.5, unit: "kg", tags: ["rubber", "tyre", "tube", "glove"] },
  // ── Metals ────────────────────────────────────────────────
  { id: "72-01", chapter: 72, chapterTitle: "Iron & steel", description: "Steel sheets, coils, bars, rods", hsCode: "7201–7229", rodtepMin: 1.5, rodtepMax: 2.5, drawbackAIR: 2.0, unit: "MT", notes: "Export duty of 15–45% on some steel products (check current notifications)", tags: ["steel", "iron", "bar", "rod", "coil"] },
  { id: "73-01", chapter: 73, chapterTitle: "Iron & steel articles", description: "Pipes, tubes, fittings, castings", hsCode: "7301–7326", rodtepMin: 2.0, rodtepMax: 3.0, drawbackAIR: 2.5, unit: "kg", tags: ["pipe", "tube", "casting", "steel", "fitting"] },
  { id: "74-01", chapter: 74, chapterTitle: "Copper & copper articles", description: "Copper wire, rods, plates", hsCode: "7401–7419", rodtepMin: 1.5, rodtepMax: 2.0, drawbackAIR: 1.5, unit: "kg", tags: ["copper", "wire"] },
  { id: "76-01", chapter: 76, chapterTitle: "Aluminium articles", description: "Aluminium sheets, profiles, extrusions", hsCode: "7601–7616", rodtepMin: 1.5, rodtepMax: 2.5, drawbackAIR: 2.0, unit: "kg", tags: ["aluminium", "aluminum", "profile", "extrusion"] },
  // ── Machinery & Electronics ──────────────────────────────
  { id: "84-01", chapter: 84, chapterTitle: "Machinery", description: "Industrial machinery, pumps, compressors", hsCode: "8401–8487", rodtepMin: 2.0, rodtepMax: 3.5, drawbackAIR: 2.5, unit: "unit", tags: ["machinery", "pump", "compressor", "industrial"] },
  { id: "85-01", chapter: 85, chapterTitle: "Electrical & electronics", description: "Electrical machinery, transformers, LEDs", hsCode: "8501–8548", rodtepMin: 1.5, rodtepMax: 2.5, drawbackAIR: 2.0, unit: "unit", tags: ["electronics", "electrical", "transformer", "led"] },
  { id: "85-02", chapter: 85, chapterTitle: "Electrical & electronics", description: "Mobile phones, semiconductors, PCBs", hsCode: "8517–8542", rodtepMin: 1.0, rodtepMax: 2.0, drawbackAIR: 1.5, unit: "unit", notes: "PLI scheme products may have additional benefits", tags: ["mobile", "phone", "semiconductor", "pcb", "electronics"] },
  // ── Engineering Goods ─────────────────────────────────────
  { id: "87-01", chapter: 87, chapterTitle: "Vehicles & auto parts", description: "Auto components, two-wheelers, parts", hsCode: "8701–8716", rodtepMin: 2.0, rodtepMax: 4.0, drawbackAIR: 3.0, unit: "unit", tags: ["auto", "automobile", "vehicle", "component"] },
  { id: "90-01", chapter: 90, chapterTitle: "Optical & medical instruments", description: "Optical instruments, medical devices", hsCode: "9001–9033", rodtepMin: 1.5, rodtepMax: 2.5, drawbackAIR: 2.0, unit: "unit", tags: ["optical", "medical", "instrument", "device"] },
  // ── Handicrafts & Furniture ──────────────────────────────
  { id: "94-01", chapter: 94, chapterTitle: "Furniture & bedding", description: "Wooden furniture, mattresses, lamps", hsCode: "9401–9406", rodtepMin: 2.5, rodtepMax: 4.0, drawbackAIR: 3.5, unit: "unit", tags: ["furniture", "wooden", "mattress", "lamp"] },
  { id: "44-01", chapter: 44, chapterTitle: "Wood & wood articles", description: "Plywood, MDF, wooden articles, handicrafts", hsCode: "4401–4421", rodtepMin: 2.0, rodtepMax: 3.5, drawbackAIR: 2.5, unit: "unit", tags: ["wood", "plywood", "mdf", "handicraft"] },
  { id: "69-01", chapter: 69, chapterTitle: "Ceramic products", description: "Tiles, tableware, sanitary ware, figurines", hsCode: "6901–6914", rodtepMin: 2.5, rodtepMax: 4.0, drawbackAIR: 3.0, unit: "piece", tags: ["ceramic", "tile", "tableware", "sanitary"] },
  { id: "70-01", chapter: 70, chapterTitle: "Glass articles", description: "Glass tableware, bangles, decorative glass", hsCode: "7010–7020", rodtepMin: 2.5, rodtepMax: 3.5, drawbackAIR: 2.5, unit: "piece", tags: ["glass", "bangle", "tableware", "decorative"] },
  { id: "46-01", chapter: 46, chapterTitle: "Straw & basketwork", description: "Bamboo products, cane furniture, wickerwork", hsCode: "4601–4602", rodtepMin: 3.0, rodtepMax: 4.5, drawbackAIR: 3.5, unit: "unit", tags: ["bamboo", "cane", "basket", "wicker", "handicraft"] },
  // ── Chemicals & Dyes ─────────────────────────────────────
  { id: "32-01", chapter: 32, chapterTitle: "Dyes, pigments & paints", description: "Reactive dyes, pigments, paints, inks", hsCode: "3201–3215", rodtepMin: 2.5, rodtepMax: 4.0, drawbackAIR: 3.0, unit: "kg", tags: ["dye", "pigment", "paint", "ink", "chemical"] },
  { id: "38-01", chapter: 38, chapterTitle: "Misc chemical products", description: "Agro-chemicals, pesticides, adhesives", hsCode: "3801–3826", rodtepMin: 2.0, rodtepMax: 3.5, drawbackAIR: 2.5, unit: "kg", tags: ["agro-chemical", "pesticide", "adhesive", "chemical"] },
];

export const CHAPTER_TITLES: Record<number, string> = {
  3: "Fish & Seafood", 8: "Fruits & Nuts", 9: "Spices", 10: "Cereals",
  17: "Sugar", 19: "Food Preparations", 21: "Misc Food", 24: "Tobacco",
  29: "Organic Chemicals", 30: "Pharmaceuticals", 32: "Dyes & Pigments",
  33: "Cosmetics", 38: "Misc Chemicals", 39: "Plastics", 40: "Rubber",
  41: "Leather", 42: "Leather Articles", 44: "Wood Articles", 46: "Bamboo & Basketwork",
  52: "Cotton", 54: "Man-made Filaments", 55: "Man-made Fibres",
  60: "Knitted Fabrics", 61: "Knitted Apparel", 62: "Woven Apparel",
  63: "Home Textiles", 64: "Footwear", 69: "Ceramics", 70: "Glass",
  71: "Gems & Jewellery", 72: "Iron & Steel", 73: "Steel Articles",
  74: "Copper", 76: "Aluminium", 84: "Machinery", 85: "Electronics",
  87: "Vehicles & Auto Parts", 90: "Instruments", 94: "Furniture",
};
