import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "STL Prime | Data Frontier 3D Printing",
    description: "A próxima fronteira da impressão 3D orientada a dados.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-slate-950 text-slate-50`}>
                <CartProvider>
                    <CartDrawer />
                    {children}
                </CartProvider>
            </body>
        </html>
    );
}
