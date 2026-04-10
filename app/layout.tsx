import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Navbar from "./components/navbar";
import Providers from "./lib/providers";
import { EntryAnimationProvider } from "./context/entry-animation-context";
import "./globals.css";
import { cn } from "@/lib/utils";
import NormalizeRoute from "@/lib/normalize-route";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-label",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Andy Zhuo | Portfolio",
  description: "UX Design Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        spaceGrotesk.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>
          <EntryAnimationProvider>
            <GoogleAnalytics gaId="G-TB6WHNRW8J" />
            <NormalizeRoute />
            <Navbar />
            {children}
          </EntryAnimationProvider>
        </Providers>
      </body>
    </html>
  );
}
