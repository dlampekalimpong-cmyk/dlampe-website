# D-LAMPE Website — Deployment Guide

This is a small web app, not just one page. It comes as a folder with a few files
that all need to be uploaded together:

```
index.html          → your public storefront
admin.html           → your private admin panel (add/edit/delete products)
app.js                → storefront logic
admin.js              → admin panel logic
styles.css            → shared design
firebase-config.js    → your database connection (fill in once — see SETUP-FIREBASE.md)
starter-data.js       → the built-in starter catalogue (38 products) + logo/banner images
```

Works great on phones (Android/iPhone) and desktop out of the box — it's fully responsive.

## Step 1: Deploy the files (free, ~2 minutes)

### Option A — Netlify (recommended, easiest)
1. Go to https://app.netlify.com/drop
2. Drag the **whole folder** (all 7 files) onto the page at once.
3. Netlify gives you an instant free link like `random-name-123.netlify.app`.
4. To rename it: Site settings → Change site name → e.g. `dlampe-kalimpong.netlify.app`.
5. (Optional) To use your own domain like `dlampekalimpong.com`, buy the domain
   elsewhere (~₹700–1200/yr — this is the only part that isn't free) and connect
   it under Domain settings in Netlify.

### Option B — GitHub Pages
1. Create a free account at https://github.com if needed.
2. Create a new repository, e.g. `dlampe-website`, and upload all 7 files to it.
3. Settings → Pages → Source: `main` branch, root folder → Save.
4. Your site goes live at `https://yourusername.github.io/dlampe-website/`.

**The site works immediately after this step** — it shows the built-in 38-product
starter catalogue. To be able to add/change products yourself, do Step 2.

## Step 2: Connect the free database + admin login
Follow **SETUP-FIREBASE.md** — a one-time, ~10 minute setup using a free Google
Firebase project. After that:
- Your admin panel lives at `yoursite.com/admin.html`
- Log in with the email/password you set up
- Add, edit, or delete products any time — changes appear on the live site
  instantly for every visitor, no re-deploying needed

## Updating the site design or copy later
For anything beyond adding/editing products (changing colors, text, adding a new
section, etc.), just tell me what you'd like and I'll hand you updated files —
re-upload them the same way (drag-and-drop again on Netlify, or re-upload to
GitHub) to update the live site.

## What's built in
- Modern, dark, mobile-first design with a bottom app-style nav bar on phones
- Full product catalogue with photos, descriptions and quick spec tags
- "Add to order" cart — customers build a list, then tap **Send Order via
  WhatsApp**, which opens WhatsApp with the full itemized list pre-filled to your
  number (9749011226)
- Per-product "Enquire on WhatsApp" button for one-off questions
- Live-editable admin panel (once Firebase is connected) — no coding needed to
  add new products later
- Your BIS certification badge, GSTIN, shop hours, and an embedded Google Map

## Notes
- No prices are shown on the site since you quote wholesale rates on request —
  customers send their order/enquiry and you reply with pricing.
- Until Firebase is connected, the admin panel will show a message asking you to
  finish setup — the public site still works fine in the meantime using the
  built-in starter catalogue.
