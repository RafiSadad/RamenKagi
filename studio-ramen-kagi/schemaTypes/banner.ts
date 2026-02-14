import { defineType, defineField } from 'sanity'

export const banner = defineType({
    name: 'banner',
    title: 'Banner',
    type: 'document',
    description: 'Banner carousel di halaman utama (maks. 3 tampil). Urutan pakai field Order.',
    fields: [
        defineField({
            name: 'title',
            title: 'Label / Badge',
            type: 'string',
            description: 'Teks kecil di atas (misal: PROMO TEMAN KAGI)',
        }),
        defineField({
            name: 'headline',
            title: 'Headline',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle',
            type: 'string',
        }),
        defineField({
            name: 'mediaUrl',
            title: 'Media URL (Cloudinary)',
            type: 'url',
            description: 'Link gambar atau video dari Cloudinary. Tidak di-upload ke Sanity. Rasio disarankan 16:9 atau 2:1 untuk banner. Lihat ASSETS_GUIDE.md.',
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
            name: 'link',
            title: 'Link (opsional)',
            type: 'url',
            description: 'URL saat banner diklik',
        }),
        defineField({
            name: 'order',
            title: 'Urutan',
            type: 'number',
            description: 'Angka kecil = tampil lebih dulu. Maks. 3 banner tampil di carousel.',
            initialValue: 0,
        }),
    ],
    orderings: [
        { title: 'Urutan', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
        { title: 'Terbaru', name: 'createdDesc', by: [{ field: '_createdAt', direction: 'desc' }] },
    ],
    preview: {
        select: { headline: 'headline', title: 'title' },
        prepare({ headline, title }) {
            return {
                title: title || headline || 'Banner',
                subtitle: headline,
            }
        },
    },
})
