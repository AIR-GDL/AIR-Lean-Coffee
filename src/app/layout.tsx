import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { LoaderProvider } from "@/context/LoaderContext";
import { PusherProvider } from "@/context/PusherContext";
import PreloadLink from "@/components/PreloadLink";

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-opensans",
});

export const metadata: Metadata = {
  title: "AIR Lean Coffee",
  description: "A collaborative lean coffee board for productive discussions",
  icons: {
    icon: "/icon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.className} h-screen`} suppressHydrationWarning={true}>
      <head>
        <PreloadLink />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=shield,thumb_up,thumb_down,equal" />
        <style>{`
          .material-symbols-rounded {
            font-variation-settings:
            'FILL' 0,
            'wght' 400,
            'GRAD' 0,
            'opsz' 24
          }
        `}</style>
      </head>
      <body className="antialiased flex flex-col h-screen overflow-hidden" suppressHydrationWarning={true}>
        <PusherProvider>
          <LoaderProvider>
            {children}
            <Toaster position="bottom-center" richColors closeButton />
          </LoaderProvider>
        </PusherProvider>
      </body>
    </html>
  );
}
