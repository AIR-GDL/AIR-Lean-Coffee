import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Footer from "@/components/Footer";
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
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
            <Footer />
            <Toaster
            position="top-right"
            theme="light"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg',
                description: 'group-[.toast]:text-gray-600',
                actionButton: 'group-[.toast]:bg-blue-600 group-[.toast]:text-white',
                cancelButton: 'group-[.toast]:bg-gray-200 group-[.toast]:text-gray-900',
                success: 'group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200',
                error: 'group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200',
              },
            }}
            />
          </LoaderProvider>
        </PusherProvider>
      </body>
    </html>
  );
}
