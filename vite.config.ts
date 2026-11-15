import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // host: доступ с телефона по IP; https: камера (getUserMedia) требует
  // защищённый контекст — Safari разрешит её только по HTTPS.
  server: {
    host: true,
    https: true,
  },
  plugins: [react(), basicSsl(), VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "ProCal",
        short_name: "ProCal",
        description: "Дневное питание, калории, вода и БЖУ.",
        theme_color: "#f3f2ef",
        background_color: "#f3f2ef",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icon-192.png?v=6", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png?v=6", sizes: "512x512", type: "image/png" },
          {
            src: "icon-512.png?v=6",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "index.html",
      },
  }),
  ],
});
