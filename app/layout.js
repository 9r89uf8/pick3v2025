// app/layout.jsx
import React from 'react';
import Navbar from "@/app/components/Navbar";
import "./globals.css";

const Layout = ({ children }) => {
  return (
    <html lang="es" className="bg-background text-foreground">
      <body className="min-h-screen bg-background text-foreground">
        <main className="pb-[90px]">{children}</main>
      </body>
    </html>
  );
};

export default Layout;
