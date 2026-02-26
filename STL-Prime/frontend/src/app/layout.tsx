import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

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
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-df-lightBg text-df-dark`}>
                <Navbar />
                {children}
            </body>
        </html>
    );
}
