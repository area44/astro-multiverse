import { defineConfig } from "astro/config";
import { FontaineTransform } from "fontaine";

const site = process.env.VERCEL
  ? process.env.VERCEL_ENV === "production"
    ? "https://astro-multiverse.vercel.app"
    : `https://${process.env.VERCEL_URL}`
  : (process.env.site ?? "http://localhost:4321");
const base = process.env.base || "/";

// https://astro.build/config
export default defineConfig({
  site,
  base,
  vite: {
    plugins: [
      FontaineTransform.vite({
        fallbacks: ["Arial"],
        resolvePath: (id) => new URL(`./public${id}`, import.meta.url),
      }),
    ],
  },
});
