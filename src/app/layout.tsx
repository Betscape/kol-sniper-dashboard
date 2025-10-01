import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KOL Sniper Dashboard",
  description: "Ultimate Copytrading Hub for Solana Meme Coins",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
