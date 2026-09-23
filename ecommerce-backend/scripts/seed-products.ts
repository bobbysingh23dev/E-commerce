// One-off seed: adds a few categories + ~120 realistic products with images.
// Run with:  npx tsx scripts/seed-products.ts
import { pool } from "../src/config/db";

type Cat = {
  name: string;
  types: string[];
  adjectives: string[];
  price: [number, number];
};

const CATEGORIES: Cat[] = [
  {
    name: "Apparel",
    types: [
      "T-Shirt",
      "Hoodie",
      "Jeans",
      "Jacket",
      "Scarf",
      "Cap",
      "Socks",
      "Sweater",
      "Shorts",
      "Dress",
      "Coat",
      "Cardigan",
    ],
    adjectives: [
      "Cotton",
      "Wool",
      "Denim",
      "Classic",
      "Slim-Fit",
      "Vintage",
      "Premium",
      "Linen",
      "Fleece",
      "Oversized",
      "Striped",
    ],
    price: [12, 120],
  },
  {
    name: "Kitchenware",
    types: [
      "Bowl",
      "Plate",
      "Mug",
      "Pan",
      "Pot",
      "Knife",
      "Kettle",
      "Cutting Board",
      "Whisk",
      "Colander",
      "Tumbler",
      "Teapot",
    ],
    adjectives: [
      "Ceramic",
      "Stainless Steel",
      "Glass",
      "Wooden",
      "Non-stick",
      "Cast Iron",
      "Bamboo",
      "Enamel",
    ],
    price: [6, 90],
  },
  {
    name: "Electronics",
    types: [
      "Headphones",
      "Speaker",
      "Mouse",
      "Keyboard",
      "Charger",
      "Webcam",
      "Power Bank",
      "USB Hub",
      "Monitor",
      "Earbuds",
      "Smart Plug",
      "LED Strip",
    ],
    adjectives: [
      "Wireless",
      "Bluetooth",
      "USB-C",
      "Portable",
      "Gaming",
      "Mechanical",
      "HD",
      "Fast-Charge",
      "Compact",
      "RGB",
    ],
    price: [9, 260],
  },
  {
    name: "Books",
    types: [
      "Novel",
      "Cookbook",
      "Travel Guide",
      "Journal",
      "Notebook",
      "Sketchbook",
      "Biography",
      "Anthology",
      "Planner",
      "Puzzle Book",
    ],
    adjectives: [
      "Illustrated",
      "Hardcover",
      "Pocket",
      "Collector's",
      "Beginner's",
      "Advanced",
      "Leather-Bound",
      "Classic",
    ],
    price: [6, 45],
  },
  {
    name: "Home & Living",
    types: [
      "Table Lamp",
      "Throw Pillow",
      "Blanket",
      "Vase",
      "Scented Candle",
      "Area Rug",
      "Photo Frame",
      "Woven Basket",
      "Wall Clock",
      "Mirror",
      "Planter",
    ],
    adjectives: [
      "Decorative",
      "Minimalist",
      "Handwoven",
      "Ceramic",
      "Wooden",
      "Modern",
      "Rustic",
      "Velvet",
    ],
    price: [10, 110],
  },
  {
    name: "Sports & Outdoors",
    types: [
      "Water Bottle",
      "Yoga Mat",
      "Dumbbell",
      "Backpack",
      "Tent",
      "Jump Rope",
      "Resistance Band",
      "Foam Roller",
      "Cooler Bag",
      "Camping Chair",
    ],
    adjectives: [
      "Insulated",
      "Non-slip",
      "Adjustable",
      "Waterproof",
      "Lightweight",
      "Foldable",
      "Heavy-Duty",
      "Quick-Dry",
    ],
    price: [8, 160],
  },
];

const PER_CATEGORY = 20;

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let inserted = 0;

    for (const cat of CATEGORIES) {
      // Ensure the category exists; get its id either way (upsert).
      const c = await client.query(
        `INSERT INTO categories (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [cat.name],
      );
      const categoryId = c.rows[0].id;

      for (let i = 0; i < PER_CATEGORY; i++) {
        const adj = pick(cat.adjectives);
        const type = pick(cat.types);
        const name = `${adj} ${type}`;
        const price = (
          rand(cat.price[0] * 100, cat.price[1] * 100) / 100
        ).toFixed(2);
        const stock = rand(0, 300);
        const description = `${adj} ${type.toLowerCase()} — a quality ${cat.name.toLowerCase()} pick.`;
        const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${categoryId}-${i}`;
        const imageUrl = `https://picsum.photos/seed/${slug}/400/400`;

        await client.query(
          `INSERT INTO products (name, description, price, stock_quantity, category_id, image_url)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [name, description, price, stock, categoryId, imageUrl],
        );
        inserted++;
      }
    }

    // Give the original products an image too.
    await client.query(
      `UPDATE products
       SET image_url = 'https://picsum.photos/seed/prod' || id || '/400/400'
       WHERE image_url IS NULL`,
    );

    await client.query("COMMIT");
    const total = await pool.query("SELECT count(*) FROM products");
    console.log(
      `✅ Inserted ${inserted} products. Total now: ${total.rows[0].count}`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

main()
  .then(() => pool.end())
  .catch((e) => {
    console.error(e);
    pool.end();
    process.exit(1);
  });
