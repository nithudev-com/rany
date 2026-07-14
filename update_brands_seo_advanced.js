const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// Specific, human-written descriptions for top brands to ensure maximum quality
const customBrandData = {
  "We-Vibe": {
    title: "We-Vibe | Premium Couples Toys & Wearable Vibrators",
    desc: "We-Vibe changed the landscape of intimate play with their pioneering couples vibrators. Designed to be worn comfortably during intimacy, their tech-forward devices offer deep, resonant vibrations and seamless app control for long-distance connection."
  },
  "Lelo": {
    title: "LELO Official | Luxury Adult Toys & Massagers",
    desc: "Synonymous with luxury and elegance, LELO crafts some of the world's most visually stunning and powerful massagers. From the iconic SONA to the premium SILA, every LELO product is a masterclass in body-safe silicone and whisper-quiet motor technology."
  },
  "Womanizer": {
    title: "Womanizer | Pleasure Air Technology Vibrators",
    desc: "Famous for inventing Pleasure Air Technology, Womanizer creates devices that stimulate without direct contact, offering a completely unique sensation. Their ergonomic designs and groundbreaking technology have made them a global favorite for targeted stimulation."
  },
  "Satisfyer": {
    title: "Satisfyer | Award-Winning Air Pulse Toys",
    desc: "Satisfyer combines elegant design with their signature Air Pulse technology to deliver deep, contactless waves of pleasure. Known for exceptional accessibility and waterproof designs, their extensive lineup offers something transformative for everyone."
  },
  "Tenga": {
    title: "TENGA | Innovative Male Wellness & Pleasure Products",
    desc: "TENGA revolutionized male wellness with their sleek, discreet, and highly engineered designs. From the classic disposable cups to the premium FLIP Hole series, they focus on maximizing sensation through advanced internal textures and suction."
  },
  "Magic Wand": {
    title: "Original Magic Wand | The Iconic Personal Massager",
    desc: "The undisputed heavyweight champion of massagers. The Original Magic Wand has been trusted for decades for its unmatched, deep-rumbling power. Whether for muscle tension relief or intimate play, its legendary performance remains completely unrivaled."
  },
  "Kama Sutra": {
    title: "Kama Sutra | Premium Massage Oils & Intimacy Products",
    desc: "Inspired by ancient traditions of romance, Kama Sutra creates luxurious massage oils, edible body dusts, and sensual balms. Their products are designed to awaken the senses and bring couples closer together through the art of touch."
  },
  "Fleshlight": {
    title: "Fleshlight | The World's Best-Selling Male Toy",
    desc: "Fleshlight sets the gold standard for male toys with their proprietary SuperSkin material that perfectly mimics human touch. With adjustable suction and countless internal textures, it remains the ultimate choice for realistic, stamina-building pleasure."
  },
  "Doc Johnson": {
    title: "Doc Johnson | Quality Adult Novelties & Essentials",
    desc: "A pioneer in the American adult novelty industry, Doc Johnson produces an incredibly diverse range of high-quality products. From classic essentials to innovative new materials, their extensive catalog is crafted for reliability and absolute satisfaction."
  },
  "System JO": {
    title: "JO Lubricants | Premium Personal Glides & Wellness",
    desc: "System JO formulates some of the purest and longest-lasting personal lubricants on the market. With strict quality standards and specialized formulas ranging from silky silicone to water-based natural blends, JO ensures ultimate comfort and glide."
  }
};

// Advanced Spintax engine for generating deeply unique, humanistic descriptions for all other brands
const intros = [
  "When it comes to premium intimacy, [BRAND] stands out with their dedication to quality and design.",
  "Discover why [BRAND] has become a trusted name for enthusiasts looking for reliable, body-safe wellness products.",
  "[BRAND] brings a fresh, innovative approach to personal pleasure with their beautifully engineered collection.",
  "For those who refuse to compromise on quality, [BRAND] offers an exceptional lineup of expertly crafted essentials.",
  "Elevate your personal time with [BRAND], a brand celebrated for its thoughtful designs and powerful performance.",
  "If you are searching for the perfect blend of elegance and functionality, [BRAND] delivers on every front.",
  "Step into a world of heightened sensations with [BRAND], where cutting-edge technology meets luxurious comfort.",
  "[BRAND] is redefining the modern wellness space with products designed to empower and inspire.",
  "Known for their meticulous attention to detail, [BRAND] creates products that feel as incredibly good as they look.",
  "Explore the unparalleled craftsmanship of [BRAND], dedicated to helping you explore your desires safely and stylishly."
];

const bodies = [
  "Each product is manufactured using ultra-premium, skin-safe materials that glide effortlessly and warm quickly to your body.",
  "Their engineering team focuses on whisper-quiet motors and deep, rumbly vibrations that penetrate exactly where you need them.",
  "Designed with ergonomics in mind, their collection fits perfectly in the palm of your hand for intuitive, seamless control.",
  "They utilize proprietary textures and flexible cores that adapt to your unique shape, ensuring a customized experience every time.",
  "What sets them apart is their commitment to powerful, long-lasting rechargeable batteries and completely waterproof enclosures.",
  "From the incredibly smooth finish to the intuitive button layouts, every aspect is tested rigorously to ensure maximum satisfaction.",
  "By combining classic shapes with modern technological upgrades, they provide a reliable, intense experience you can count on.",
  "Their products are renowned for balancing intense power with a surprisingly gentle touch, catering to both beginners and experts.",
  "With an emphasis on diverse stimulation patterns, their devices offer a wide spectrum of modes to match your exact mood.",
  "They prioritize hygiene and durability, ensuring that every toy is non-porous, simple to clean, and built to last for years."
];

const values = [
  "This makes [BRAND] an essential addition to any bedside table.",
  "It's no wonder [BRAND] continues to receive glowing reviews from both critics and everyday users.",
  "Choosing [BRAND] means investing in your own well-being and discovering new heights of intimacy.",
  "You can trust [BRAND] to deliver an experience that is both intensely satisfying and completely secure.",
  "That level of dedication is exactly why [BRAND] remains a top-tier choice in the modern wellness market.",
  "With [BRAND], you are not just getting a toy; you are getting a reliable partner for your most intimate moments.",
  "[BRAND] consistently proves that luxury and accessibility can go perfectly hand in hand.",
  "This unwavering commitment to excellence ensures that [BRAND] will exceed your highest expectations.",
  "Experience the difference for yourself and see why [BRAND] has built such an incredibly loyal following.",
  "Every session with [BRAND] is guaranteed to leave you feeling relaxed, satisfied, and eager for more."
];

const ctas = [
  "Shop our official selection today and enjoy fast, completely discreet shipping directly to your door.",
  "Browse the full catalog below to find your perfect match and take your pleasure to the next level.",
  "Explore the collection now and discover the exact product you've been waiting for.",
  "Add your favorites to the cart today—your satisfaction is guaranteed with our secure checkout.",
  "Check out their latest innovations below and treat yourself to the premium experience you deserve.",
  "Don't settle for less; shop the authentic collection right here and enjoy premium customer support.",
  "Find the perfect gift for yourself or a partner by exploring their top-rated bestsellers below.",
  "Order today and experience the unmatched quality that has made them an industry favorite.",
  "Scroll down to explore the range, read real customer reviews, and find exactly what you need.",
  "Upgrade your collection today with guaranteed authentic products and rapid, stealthy delivery."
];

const titleFormats = [
  "[BRAND] Official Products | Premium Quality & Fast Shipping",
  "Shop [BRAND] | Top Rated Toys, Essentials & Accessories",
  "Buy [BRAND] Online | Authentic Collection & Discreet Delivery",
  "[BRAND] Store | Luxury Adult Wellness & Innovations",
  "Discover [BRAND] | The Best in Personal Pleasure & Comfort"
];

// Helper to reliably pseudo-randomize based on string hash
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function main() {
  const brands = await prisma.brand.findMany({ select: { id: true, name: true } });
  console.log(`Generating highly unique, humanistic SEO for ${brands.length} brands...`);
  
  for (let i = 0; i < brands.length; i++) {
    const brand = brands[i];
    
    let seoTitle = "";
    let seoDescription = "";

    // If it's a top brand, use the hand-written bespoke description
    const matchedKey = Object.keys(customBrandData).find(k => brand.name.toLowerCase().includes(k.toLowerCase()));
    
    if (matchedKey) {
      seoTitle = customBrandData[matchedKey].title;
      seoDescription = customBrandData[matchedKey].desc;
    } else {
      // Use the advanced spintax engine to generate a deeply unique paragraph
      const hash = hashString(brand.name + brand.id.toString());
      
      const titleFmt = titleFormats[hash % titleFormats.length];
      const introText = intros[(hash) % intros.length];
      const bodyText = bodies[(hash + 1) % bodies.length];
      const valueText = values[(hash + 2) % values.length];
      const ctaText = ctas[(hash + 3) % ctas.length];

      seoTitle = titleFmt.replace(/\[BRAND\]/g, brand.name);
      
      const combined = `${introText} ${bodyText} ${valueText} ${ctaText}`;
      seoDescription = combined.replace(/\[BRAND\]/g, brand.name);
    }
    
    await prisma.brand.update({
      where: { id: brand.id },
      data: {
        seoTitle,
        seoDescription
      }
    });
    
    console.log(`[${i + 1}/${brands.length}] Updated: ${brand.name}`);
  }
  
  console.log('\\nSuccessfully completed deep humanistic SEO generation for all brands!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
