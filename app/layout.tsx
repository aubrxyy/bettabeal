import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import Template from "./template";
import ClientLayout from "./clientlayout";
import { Slide, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
        <ToastContainer
          autoClose={3000}
          pauseOnFocusLoss
          hideProgressBar
          newestOnTop
          closeOnClick
          transition={Slide}
          position="top-right"
          className={`mt-20 rounded-sm  `}
          stacked
        />
      </body>
    </html>
  );
}