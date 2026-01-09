import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Load standard Google Font (Inter)
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Job Nexus | Campus Placement Platform",
  description: "Connect students, recruiters, and faculty in one unified platform.",
};

// CRITICAL: Ensures the app scales correctly on mobile devices
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a', // Matches your background color for a native app feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0f172a]`}>
        {children}
      </body>
    </html>
  );
}