import { createClient } from "@sanity/client";

export const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "j2xbsoqh",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    useCdn: true,
});

export async function getCategories() {
    return sanityClient.fetch(
        `*[_type == "category"] | order(order asc) {
            _id, title, "slug": slug.current, icon, order
        }`
    );
}

export async function getMenuItems() {
    return sanityClient.fetch(
        `*[_type == "menuItem"] {
            _id, name, "slug": slug.current,
            "image": image.asset->url,
            videoUrl,
            price, description,
            "category": category->slug.current,
            isPopular, isUpsell, toppings
        }`
    );
}

/** Banner hero carousel, max 3. Ordered by order asc, then _createdAt. */
export async function getBanners() {
    return sanityClient.fetch(
        `*[_type == "banner"] | order(order asc, _createdAt asc)[0...3] {
            _id, title, headline, subtitle,
            "image": image.asset->url,
            link, order
        }`
    );
}
