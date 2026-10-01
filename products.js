/* PRICES BELOW ARE PLACEHOLDERS: replace with your real prices.
   EDIT THIS FILE to change what is for sale.
   available:false  -> card and page show "Not available" and buying is turned off.
   price:null       -> shows "Ask for price". Use a number (e.g. 80) to show ₱80.00 and a total.
   Each variant can have its own available / price. */
window.PRODUCTS = [
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', image: 'images/products/lettuce.jpg',
    desc: 'Fresh hydroponically grown lettuce and leafy greens. Romaine, Lollo Bionda, and Crystal varieties.',
    available: true, price: 80, unit: 'per head', variantLabel: 'Variety',
    variants: [
      { name: 'Romaine', available: true, price: 80 },
      { name: 'Lollo Bionda', available: true, price: 85 },
      { name: 'Crystal', available: true, price: 90 }
    ] },
  { id: 'basil', name: 'Basil', emoji: '🌿', image: 'images/products/basil.jpg',
    desc: 'Fresh hydroponic basil.', available: true, price: 60, unit: 'per pack' },
  { id: 'arugula', name: 'Arugula', emoji: '🍃', image: 'images/products/arugula.jpg',
    desc: 'Peppery leafy greens, grown hydroponically.', available: true, price: 70, unit: 'per pack' },
  { id: 'seeds-seedlings', name: 'Seeds & Seedlings', emoji: '🌱', image: 'images/products/seeds-seedlings.jpg',
    desc: 'Start your own system with quality starts.', available: true, price: 25, unit: 'per seedling' },
  { id: 'hydroponic-materials', name: 'Hydroponic Materials', emoji: '🧪', image: 'images/products/hydroponic-materials.jpg',
    desc: 'Supplies for building and running your setup.', available: true, price: 150, unit: 'per set' },
  { id: 'system-components', name: 'System Components', emoji: '🧰', image: 'images/products/system-components.jpg',
    desc: 'Parts for Kratky and NFT systems.', available: true, price: 250, unit: 'per piece' }
];

/* SHIPPING: fee depends on distance. A customer whose City/Barangay contains a name in nearAreas gets nearFee,
   everyone else gets farFee. Add more places to nearAreas, then set the fees (e.g. nearFee: 50, farFee: 150).
   Fee left as null = shown as "fee confirmed by us" and the total stays "To be confirmed". */
window.SHIPPING = { nearAreas: ['San Fernando'], nearFee: 50, farFee: 150 };
