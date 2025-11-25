"use client";

import { Layout, message } from "antd";
import { Content, Footer } from "antd/es/layout/layout";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LayoutSider } from "@/components/Sidebar";
import { I18nextProvider, useTranslation } from "react-i18next";
import LocaleProvider from "@/components/locale-provider";
import "../globals.css";
import { toast, Toaster } from "sonner";
import HeaderCMS from "@/components/header";
import { i18nInstance } from "@/language/i18n";
import MobileNav from "@/components/MobileNav";
import { getRoleUser, isTokenExpired } from "@/lib/utils";
import "antd/dist/reset.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user || !user.id) {
        router.push("/signin");
      }
    }
    const token = localStorage.getItem("accessToken");
    if (!token || isTokenExpired(token)) {
      toast.warning("Phiên đăng nhập hết hạn. Hãy đăng nhập lại");
      router.push("/signin");
    }
    if (getRoleUser() === "NONE") {
      toast.error("Bạn không có quyền truy cập vào trang này.");
      router.push("/signin");
    }
  }, [router]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <html lang={"en"}>
      <head>
        <title>TSE Club - CMS</title>
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <LocaleProvider>
            {() => (
              <I18nextProvider i18n={i18nInstance}>
                <Layout className="layout" id="mtb-erp-app">
                  <LayoutSider collapsed={collapsed} language={"en"} />
                  <Layout className="!bg-white">
                    {isMobile && <MobileNav />}

                    <HeaderCMS
                      collapsed={collapsed}
                      setCollapsed={setCollapsed}
                      userAvatar={userAvatar}
                    />
                    <Content style={styles.content}>
                      <Layout
                        className="site-layout-background rounded-[8px] !bg-white"
                        style={styles.layout}
                      >
                        <Content
                          style={{
                            overflowY: "scroll",
                            height: "calc(100vh - 65px)",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                          }}
                        >
                          <Toaster
                            richColors
                            position="top-center"
                            duration={2000}
                          />
                          <div className="min-h-[calc(100vh-115px)]">
                            {children}
                          </div>
                          <Footer
                            style={{
                              textAlign: "center",
                              padding: "12px 50px",
                              borderTop: "1px solid #e8e8e8",
                              alignSelf: "flex-end",
                            }}
                          >
                            Copyright 2025 by DoubleM
                          </Footer>
                        </Content>
                      </Layout>
                    </Content>
                  </Layout>
                </Layout>
              </I18nextProvider>
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
