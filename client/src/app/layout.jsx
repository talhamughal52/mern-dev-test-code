import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./_hooks/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Test Dev App",
  description: "A test app for MERN development",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
