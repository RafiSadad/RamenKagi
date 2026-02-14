import { defineType, defineField } from 'sanity'

export const menuItem = defineType({
    name: 'menuItem',
    title: 'Menu Item',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'name', maxLength: 96 },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'mediaUrl',
            title: 'Media URL (Cloudinary)',
            type: 'url',
            description: 'Link gambar atau video dari Cloudinary. Tidak di-upload ke Sanity (hemat limit). Rasio disarankan 1:1 atau 4:3. Lihat ASSETS_GUIDE.md.',
        }),
        defineField({
            name: 'mediaType',
            title: 'Tipe Media',
            type: 'string',
            options: {
                list: [
                    { title: 'Gambar', value: 'image' },
                    { title: 'Video', value: 'video' },
                ],
                layout: 'radio',
            },
            description: 'Pilih apakah mediaUrl berisi gambar atau video.',
            hidden: ({ parent }) => !parent?.mediaUrl,
        }),
        defineField({
            name: 'price',
            title: 'Price (Rp)',
            type: 'number',
            validation: (rule) => rule.required().min(0),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'category' }],
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'isPopular',
            title: 'Popular?',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'isUpsell',
            title: 'Upsell?',
            type: 'boolean',
            initialValue: false,
        }),
        defineField({
            name: 'toppings',
            title: 'Toppings',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'name',
                            title: 'Topping Name',
                            type: 'string',
                            validation: (rule) => rule.required(),
                        }),
                        defineField({
                            name: 'price',
                            title: 'Extra Price (Rp)',
                            type: 'number',
                            validation: (rule) => rule.required().min(0),
                        }),
                    ],
                    preview: {
                        select: { title: 'name', subtitle: 'price' },
                        prepare({ title, subtitle }) {
                            return {
                                title: title || 'Topping',
                                subtitle: subtitle ? `Rp ${subtitle.toLocaleString('id-ID')}` : '',
                            }
                        },
                    },
                },
            ],
        }),
        defineField({
            name: 'discountPercent',
            title: 'Diskon (%)',
            type: 'number',
            validation: (rule) => rule.min(0).max(100),
            description: 'Diskon dalam persen (0–100). Isi salah satu: persen atau nominal.',
        }),
        defineField({
            name: 'discountAmount',
            title: 'Diskon (Rp)',
            type: 'number',
            validation: (rule) => rule.min(0),
            description: 'Diskon nominal dalam Rupiah. Isi salah satu: persen atau nominal.',
        }),
        defineField({
            name: 'discountLabel',
            title: 'Label diskon',
            type: 'string',
            description: 'Contoh: "Promo 20%"',
            hidden: ({ parent }) => !parent?.discountPercent && !parent?.discountAmount,
        }),
        defineField({
            name: 'discountStart',
            title: 'Mulai diskon (tanggal & jam)',
            type: 'datetime',
            description: 'Waktu mulai berlaku diskon. Kosongkan = langsung berlaku.',
            hidden: ({ parent }) => !parent?.discountPercent && !parent?.discountAmount,
        }),
        defineField({
            name: 'discountEnd',
            title: 'Selesai diskon (tanggal & jam)',
            type: 'datetime',
            description: 'Waktu selesai berlaku diskon. Kosongkan = tidak ada batas.',
            hidden: ({ parent }) => !parent?.discountPercent && !parent?.discountAmount,
            validation: (rule) =>
                rule.custom((discountEnd, context) => {
                    const start = (context.document as { discountStart?: string })?.discountStart;
                    if (start && discountEnd && new Date(discountEnd) < new Date(start)) {
                        return 'Selesai diskon harus setelah mulai diskon';
                    }
                    return true;
                }),
        }),
    ],
    preview: {
        select: { title: 'name', subtitle: 'price', mediaUrl: 'mediaUrl', mediaType: 'mediaType' },
        prepare({ title, subtitle, mediaUrl, mediaType }) {
            return {
                title: title || 'Untitled',
                subtitle: subtitle ? `Rp ${subtitle.toLocaleString('id-ID')}` : '',
                media: mediaType === 'image' && mediaUrl ? mediaUrl : undefined,
            }
        },
    },
})
