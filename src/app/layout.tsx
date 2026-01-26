import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/components/CartContext";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "E-Commerce Website",
  description: "Created by Adnan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <Header></Header>
          <main>{children}</main>
          <Footer></Footer>
        </CartProvider>
      </body>
    </html>
  );
}
