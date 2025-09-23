import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream } from "fs";
import { getRoutes } from "./routes.js";

const generateSitemap = async () => {
  const sitemap = new SitemapStream({
    hostname: "https://buzz-it-eight.vercel.app",
  });

  const routes = await getRoutes();

  routes.forEach((route) =>
    sitemap.write({ url: route, changefreq: "weekly", priority: 0.8 })
  );

  sitemap.end();
  const data = await streamToPromise(sitemap);
  createWriteStream("./public/sitemap.xml").write(data.toString());

  console.log("✅ Sitemap generated successfully!");
};

generateSitemap();
