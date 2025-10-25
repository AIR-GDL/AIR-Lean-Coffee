import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Footer from "@/components/Footer";
import { LoaderProvider } from "@/context/LoaderContext";
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
    <html lang="en" className={openSans.className} suppressHydrationWarning={true}>
      <head>
        <PreloadLink />
      </head>
      <body className="antialiased flex flex-col min-h-screen" suppressHydrationWarning={true}>
        <LoaderProvider>
          <main className="flex-1">
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
      </body>
    </html>
  );
}
