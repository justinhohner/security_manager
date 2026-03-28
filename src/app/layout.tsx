// ABOUTME: Defines the root document layout for the Security Manager application.
// ABOUTME: Provides shared metadata and the global app shell entry point.
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Security Manager",
  description: "Agentic security management for assessments, findings, and remediation planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
