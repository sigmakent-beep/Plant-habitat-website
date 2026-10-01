# Plant Habitat website

```
plant-habitat/
├── index.html
├── css/styles.css
├── js/main.js        (menu + contact form)
├── js/products.js    (EDIT: products, stock, prices)
├── js/shop.js        (product page, order drawer)
└── images/
    ├── logo.jpg          (header logo + favicon)
    ├── hero.jpg          (big image in the hero section)
    ├── products/         lettuce, basil, arugula, seeds-seedlings,
    │                     hydroponic-materials, system-components  (.jpg)
    └── gallery/          greenhouses, lettuce, hydroponic-systems,
                          workshops, construction-projects, harvest  (.jpg)
```

## Adding real photos
Drop a `.jpg` into `images/products/` or `images/gallery/` using the exact
filename above. Until a file exists, the site shows the emoji / green
placeholder for that spot, so nothing looks broken.

Suggested sizes: products ~800x360, gallery ~1200x900 (4:3), hero ~800x864.
Keep each photo under ~300 KB so the page loads fast on mobile data.

To use a different filename or a .png/.webp, edit the src in index.html.
Open index.html in a browser to preview; no build step needed.

## Products, stock and prices
Open `js/products.js`:
- `available: false` shows "Not available" on the card and product page and turns off buying.
- Each lettuce variety has its own `available` flag (e.g. mark only Crystal as unavailable).
- `price: null` shows "Ask for price". Put a number (e.g. `80`) to show ₱80.00 and an order total.

## How ordering works
Customer taps a product, picks options, and chooses Add to order or Buy it now. They fill in their details and
press **Place order**. The order goes to the admin page immediately and the customer sees a thank-you with an
order number. There is no text-message or call step and no online payment (cash on delivery / pick-up).
Orders only work when the site is running through `server.js` (see below).

## Contact form
Inquiries from the Contact section are sent to the admin page too (Inquiries tab) and saved in `data/inquiries.json`.

## Checkout and shipping
"Check out" / "Buy it now" opens a checkout page like the Buys store: contact, pick-up or ship, full address
(barangay, city, region), and an order summary with subtotal, shipping and total.
Shipping is extra and depends on distance: edit `window.SHIPPING` in `js/products.js`
(`nearAreas`, `nearFee`, `farFee`). Until fees are set, the customer sees "fee confirmed by us".

## Gallery
Clicking a gallery photo opens it large; arrows, swipe (phone) and the keyboard move between photos.

## NEW: orders, admin and tracking (needs Node.js 18+)
Run `node server.js` then open http://localhost:3000 (site) and http://localhost:3000/admin (orders).
Admin password: `root` unless you set the ADMIN_PASSWORD environment variable (e.g. `ADMIN_PASSWORD=mysecret node server.js`). Change it before putting the site online.
- Placing an order sends it to the admin page instantly; the customer gets an order number.
- Customers use "Track order" (order number + phone) to see Received → Confirmed → Preparing → Shipped → Out for delivery → Delivered (or Ready for pick-up → Completed). It refreshes every 20 seconds.
- Admin changes the status from the dropdown on each order. Orders are saved in `data/orders.json`.
- Prices are checked by the server. **Prices/fees in js/products.js are placeholders: set your real ones.**
- Address dropdowns (region, province, city, barangay) load from the free PSGC API; if it is offline the customer can type them.
- This needs a host that runs Node (VPS, Render, Railway). GitHub Pages / plain hosting cannot receive orders.

### My orders (no login)
The header **My orders** button opens tabs: All, To pay (Received/Confirmed), To ship (Preparing), To receive (Shipped/Out for delivery/Ready for pick-up), To review (Delivered/Completed, rating form). Orders are remembered on the customer's device.
