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
            name: 'image',
            title: 'Image',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'videoUrl',
            title: 'Video URL (Cloudinary)',
            type: 'string',
            description: 'Opsional. Paste URL video dari Cloudinary. Jika diisi, video ini dipakai sebagai media menu (autoplay).',
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
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'price',
            media: 'image',
        },
        prepare({ title, subtitle, media }) {
            return {
                title: title || 'Untitled',
                subtitle: subtitle ? `Rp ${subtitle.toLocaleString('id-ID')}` : '',
                media,
            }
        },
    },
})
