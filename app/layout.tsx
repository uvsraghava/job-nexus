import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Load standard Google Font (Inter)
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Job Nexus | Campus Placement Platform",
  description: "Connect students, recruiters, and faculty in one unified platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}