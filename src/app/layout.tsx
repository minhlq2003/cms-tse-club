"use client";

import { Layout, message } from "antd";
import { Content, Footer } from "antd/es/layout/layout";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LayoutSider } from "@/components/Sidebar";
import { I18nextProvider, useTranslation } from "react-i18next";
import LocaleProvider from "@/components/locale-provider";
import "./globals.css";
import { Toaster } from "sonner";
import HeaderCMS from "@/components/header";
import { i18nInstance } from "@/language/i18n";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const [userAvatar, setUserAvatar] = useState<string>("");
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

  return (
    <html lang={"en"}>
      <head>
        <title>TSE Club</title>
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <LocaleProvider>
            {() => (
              <I18nextProvider i18n={i18nInstance}>
                <Layout className="layout" id="mtb-erp-app">
                  <LayoutSider collapsed={collapsed} language={"en"} />
                  <Layout className="!bg-white">
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
                            height: "calc(100vh - 100px)",
                            padding: "0 12px",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                          }}
                        >
                          <Toaster
                            richColors
                            position="top-center"
                            duration={2000}
                          />
                          {children}
                          <Footer
                            style={{
                              textAlign: "center",
                              padding: "12px 50px",
                              borderTop: "1px solid #e8e8e8",
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
  content: { padding: "0 32px", minHeight: "calc(100vh - 134px)" },
  layout: { padding: "12px 0", borderRadius: "0.5rem" },
};
