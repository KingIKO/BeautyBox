import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "BeautyBox — Beauty Recommendations, Curated for You",
  description:
    "Create and share curated beauty product recommendation boxes with your friends.",
  metadataBase: new URL("https://beauty-box-two.vercel.app"),
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "theme-color": "#b5365a",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
