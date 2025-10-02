"use client";

import { Layout, message } from "antd";
import { Content, Footer } from "antd/es/layout/layout";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LayoutSider } from "@/components/Sidebar";
import { I18nextProvider, useTranslation } from "react-i18next";
import LocaleProvider from "@/components/locale-provider";
import "../../globals.css";
import { Toaster } from "sonner";
import HeaderCMS from "@/components/header";
import { i18nInstance } from "@/language/i18n";
import MobileNav from "@/components/MobileNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const user = JSON.parse(localStorage.getItem("user") || "{}");
  //     if (!user || !user.id) {
  //       router.push("/signin");
  //     } else if (user.role !== "admin") {
  //       router.push("/signin");
  //     }
  //   }
  // }, [router]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <html lang={"en"}>
      <head>
        <title>TSE Club | Sign in</title>
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <LocaleProvider>
            {() => (
              <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
            )}
          </LocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}

const styles = {
  content: { padding: "0", minHeight: "calc(100vh - 134px)" },
  layout: { padding: "0", borderRadius: "0.5rem" },
};
