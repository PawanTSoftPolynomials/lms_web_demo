import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { PaletteProvider, PALETTE_ANTI_FLASH_SCRIPT } from "@/providers/PaletteProvider";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/700.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import "./globals.css";
import { ChatProvider } from "@/context/ChatContext";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { NotificationProvider } from "@/context/NotificationContext";
import { ConfirmProvider } from "@/context/ConfirmContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orange LMS",
  description: "Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{ __html: PALETTE_ANTI_FLASH_SCRIPT }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <PaletteProvider>
            <QueryProvider>
              <AuthProvider>
                <ToastProvider>
                  <ConfirmProvider>
                    <NotificationProvider>
                      <ChatProvider>
                        {children}
                      </ChatProvider>
                    </NotificationProvider>
                  </ConfirmProvider>
                </ToastProvider>
              </AuthProvider>
            </QueryProvider>
          </PaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
