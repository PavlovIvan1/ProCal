import type { Metadata, Viewport } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "../src/styles/global.css";
import RegisterSW from "./register-sw";

export const metadata: Metadata = {
  title: "ProCal",
  description: "Калории под присмотром вредного коуча",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ type: "image/svg+xml", url: "/icon.svg?v=7" }],
    apple: [{ url: "/icon-192.png?v=7" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ProCal",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f2ef",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
