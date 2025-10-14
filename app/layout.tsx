import type { Metadata } from "next";
import "@/src/index.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Al Shahid - Islamic Education",
  description: "Learn Arabic, Quran, and Islamic Studies with experienced teachers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
