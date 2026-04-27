import type { Metadata } from "next";
import localFont from "next/font/local";
import { auth } from "../auth";
import { ClientSessionProvider } from "./components/shared/ClientSessionProvider/ClientSessionProvider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "MergeSignal — dependency risk before you merge",
  description:
    "MergeSignal analyzes dependency changes and surfaces runtime-impacting risks so you can merge with confidence.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientSessionProvider session={session}>
          {children}
        </ClientSessionProvider>
      </body>
    </html>
  );
}
