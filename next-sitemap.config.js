/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://hrssindia.org',
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,

  // Add dynamic gallery items as query params or anchors
//   additionalPaths: async (config) => {
//     const res = await fetch('https://hrss.cloud/api/trust/galleryitem/');
//     const galleryItems = await res.json();

//     return galleryItems.map((item) => ({
//       // Since no detail page exists, we reference the gallery page with an ID param
//       loc: `https://hrss.cloud/media/gallery/${item.image}.jpg`,
//       changefreq: 'weekly',
//       priority: 0.9,
//       lastmod: new Date(item.updatedAt || Date.now()).toISOString(),
//     }));
//   },
};
