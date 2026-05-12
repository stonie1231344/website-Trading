import "./globals.css"; 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-gray-900 text-white">
        {/* Nur hier min-h-screen lassen, damit der Hintergrund immer voll ist */}
        <main className="min-h-screen flex flex-col">{children}</main>
      </body>
    </html>
  );
}