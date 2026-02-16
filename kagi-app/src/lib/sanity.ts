import { createClient } from "@sanity/client";
import { unstable_cache } from "next/cache";

export const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "j2xbsoqh",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    useCdn: true,
});

const REVALIDATE_CATEGORIES = 300; // 5 min
const REVALIDATE_MENU = 60; // 1 min - balance freshness vs TTFB
const REVALIDATE_WELCOME = 300;
const REVALIDATE_BANNERS = 300;

export async function getCategories() {
    return unstable_cache(
        () =>
            sanityClient.fetch(
                `*[_type == "category"] | order(order asc) {
            _id, title, "slug": slug.current, icon, order
        }`
            ),
        ["sanity-categories"],
        { revalidate: REVALIDATE_CATEGORIES, tags: ["sanity"] }
    )();
}

export async function getMenuItems() {
    return unstable_cache(
        () =>
            sanityClient.fetch(
                `*[_type == "menuItem"] {
            _id, name, "slug": slug.current,
            mediaUrl, mediaType,
            detailMediaUrl, detailMediaType,
            "image": image.asset->url,
            videoUrl,
            price, description,
            discountPercent, discountAmount, discountLabel, discountStart, discountEnd,
            "category": category->slug.current,
            flavor_category, product_type, flavor_weight,
            isPopular, isUpsell
        }`
            ),
        ["sanity-menu"],
        { revalidate: REVALIDATE_MENU, tags: ["sanity"] }
    )();
}

/** Halaman welcome (singleton). Satu dokumen saja. */
export async function getWelcomePage() {
    return unstable_cache(
        () =>
            sanityClient.fetch(
                `*[_type == "welcomePage"][0] {
            _id,
            backgroundMediaUrl,
            backgroundMediaType,
            title,
            subtitle,
            ctaText
        }`
            ),
        ["sanity-welcome"],
        { revalidate: REVALIDATE_WELCOME, tags: ["sanity"] }
    )();
}

/** Banner hero carousel, max 3. Ordered by order asc, then _createdAt. */
export async function getBanners() {
    return unstable_cache(
        () =>
            sanityClient.fetch(
                `*[_type == "banner"] | order(order asc, _createdAt asc)[0...3] {
            _id, title, headline, subtitle,
            mediaUrl, mediaType,
            "image": image.asset->url,
            link, order
        }`
            ),
        ["sanity-banners"],
        { revalidate: REVALIDATE_BANNERS, tags: ["sanity"] }
    )();
}
