import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import Template from "./template";
import ClientLayout from "./clientlayout";

const interR = Inter({
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: "BettaBeal",
  description: "Application by MasTeal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${interR.className} antialiased`}>
        <Template>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Template>
      </body>
    </html>
  );
}