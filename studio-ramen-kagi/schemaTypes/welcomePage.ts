import { defineType, defineField } from 'sanity'
import { HomeIcon } from '@sanity/icons'

export const welcomePage = defineType({
    name: 'welcomePage',
    title: 'Halaman Welcome',
    type: 'document',
    icon: HomeIcon,
    description: 'Konten halaman sambutan sebelum masuk ke beranda. Hanya satu dokumen; edit yang ada.',
    fields: [
        defineField({
            name: 'backgroundMediaUrl',
            title: 'Background (URL Cloudinary)',
            type: 'url',
            description: 'Link gambar atau video dari Cloudinary untuk background. Kosongkan untuk tampilan default.',
        }),
        defineField({
            name: 'backgroundMediaType',
            title: 'Tipe Background',
            type: 'string',
            options: {
                list: [
                    { title: 'Gambar', value: 'image' },
                    { title: 'Video', value: 'video' },
                ],
                layout: 'radio',
            },
            description: 'Pilih apakah background berupa gambar atau video.',
            hidden: ({ parent }) => !parent?.backgroundMediaUrl,
        }),
        defineField({
            name: 'title',
            title: 'Judul Utama',
            type: 'string',
            description: 'Contoh: "Welcome to Kagi Ramen". Bagian "Kagi Ramen" tetap berwarna oranye.',
            initialValue: 'Welcome to Kagi Ramen',
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle / Deskripsi',
            type: 'text',
            description: 'Teks di bawah judul.',
            initialValue: 'Nikmati menu kami yang dibuat dengan penuh cinta dan cita rasa autentik Jepang.',
        }),
        defineField({
            name: 'ctaText',
            title: 'Teks Tombol',
            type: 'string',
            description: 'Teks tombol masuk ke menu.',
            initialValue: 'Lihat Menu',
        }),
    ],
    preview: {
        prepare() {
            return {
                title: 'Halaman Welcome',
                subtitle: 'Background & teks sambutan',
            }
        },
    },
})
