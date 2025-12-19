import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "CityLens - Transparent Urban Issue Tracker",
  description: "Report and track infrastructure issues in your city with full transparency",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black antialiased">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
