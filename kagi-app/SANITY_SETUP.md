# Sanity CMS Setup — Kagi Ramen

## 1. Buat Sanity Project

```bash
npx sanity@latest init --project-name "kagi-ramen" --dataset "production"
```
npm create sanity@latest -- --project j2xbsoqh --dataset production --template clean

Ikuti wizard-nya, pilih template "Clean project".

## 2. Dapatkan Credentials

Buka [sanity.io/manage](https://www.sanity.io/manage):
- **Project ID** → masukkan ke `j2xbsoqh`
- Buat API Token (read-only) → masukkan ke `skCmuYdVKAU66xwxMIANnhYSShRkiZzUEUEGd5cjHtFBK4mG08Pw2PZulWZSArPIm75wz87OxvbHt0dbHbbpFzFTCpGQNMPDMG62zr51i7bFu4GGK6ayzcCI6sGzmZc0Wt8RYftUZ9YMqU6sYbjTlbNC1fcGOmgp6S7nBl4fSshDkTECkWIW`

## 3. Schema: Category

Buat file `schemas/category.ts` di Sanity Studio:

```ts
export default {
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string', validation: (R: any) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' } },
    { name: 'icon', title: 'Icon Emoji', type: 'string' },
    { name: 'order', title: 'Sort Order', type: 'number' },
  ],
  orderings: [{ title: 'Sort Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
};
```

## 4. Schema: MenuItem

Buat file `schemas/menuItem.ts`:

```ts
export default {
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (R: any) => R.required() },
    { name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' } },
    { name: 'image', title: 'Image', type: 'image', options: { hotspot: true } },
    { name: 'price', title: 'Price (Rp)', type: 'number', validation: (R: any) => R.required().min(0) },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'category', title: 'Category', type: 'reference', to: [{ type: 'category' }] },
    { name: 'isPopular', title: 'Popular?', type: 'boolean', initialValue: false },
    { name: 'isUpsell', title: 'Upsell?', type: 'boolean', initialValue: false },
    {
      name: 'toppings',
      title: 'Toppings',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', title: 'Topping Name', type: 'string' },
          { name: 'price', title: 'Extra Price', type: 'number' },
        ],
      }],
    },
  ],
};
```

## 5. GROQ Queries

Sudah disiapkan helper query di `src/lib/sanity.ts`. Setelah mengisi credentials, data akan otomatis diambil dari Sanity.

## 6. Migrasi dari Mock Data (seed)

App sudah memakai data dari Sanity. Untuk mengisi data dummy ke Sanity sekali jalan:

1. Buat **API Token dengan write permission** di [sanity.io/manage](https://www.sanity.io/manage) → Project → API → Tokens.
2. Di folder `kagi-app`, buat/isi `.env.local`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID=j2xbsoqh` (atau project ID kamu)
   - `NEXT_PUBLIC_SANITY_DATASET=production`
   - `SANITY_API_WRITE_TOKEN=<token yang punya write>`
3. Jalankan:
   ```bash
   npm run seed:sanity
   ```
   Ini akan membuat semua **kategori** dan **menu item** (nama, harga, deskripsi, kategori, popular/upsell, toppings) di Sanity. **Foto makanan** tidak di-upload oleh script — upload manual di Sanity Studio (field Image di setiap Menu Item).
