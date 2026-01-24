import { SitemapStream, streamToPromise } from "sitemap";
import { writeFileSync } from "fs";
import { getRoutes } from "./routes.js";

const generateSitemap = async () => {
  try {
    const sitemap = new SitemapStream({
      hostname: "https://buzz-it-eight.vercel.app",
    });

    const routes = await getRoutes();

    routes.forEach((route) =>
      sitemap.write({ url: route, changefreq: "weekly", priority: 0.8 })
    );

    sitemap.end();

    const data = await streamToPromise(sitemap);

    writeFileSync("./public/sitemap.xml", data.toString());

    console.log("✅ Sitemap generated successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error generating sitemap:", err);
    process.exit(1);
  }
};

generateSitemap();
