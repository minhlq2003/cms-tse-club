"use client";

import { Button, Image, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Images } from "../constant/image";
import { useTranslation } from "react-i18next";
import { getFilteredMenuItems } from "./menuItems";

interface MenuItem {
  key: string;
  label: string;
  path?: string;
  permissionKey?: string;
  parent?: string;
  hasPermission?: boolean;
  children: MenuItem[];
}

export const LayoutSider = ({
  language,
  collapsed,
}: {
  language: string;
  collapsed: boolean;
}) => {
  const { t } = useTranslation("common");
  const route = useRouter();
  const pathname = usePathname();

  const originalMenuItems = getFilteredMenuItems();
  const [menuItems, setMenuItems] = useState(originalMenuItems);

  useEffect(() => {
    const updatedMenuItems = originalMenuItems?.map((item) => ({
      ...item,
      label: t(item?.label ?? ""),
      children: item.children?.map((child) => ({
        ...child,
        label: t(child?.label ?? ""),
        key: child.key,
      })),
    })) as MenuItem[];

    setMenuItems(updatedMenuItems);
  }, [language, originalMenuItems, t]);

  if (!menuItems) return <div> Đang load menu</div>;

  return (
    <Sider
      trigger={null}
      theme="light"
      breakpoint="lg"
      width={300}
      collapsible
      collapsed={collapsed}
      className="!bg-[#120e31] md:block hidden"
    >
      <div
        style={{
          height: 120,
          textAlign: "center",
          width: "100%",
          display: "flex",
          justifyItems: "center",
          alignItems: "center",
          padding: "0 1rem",
        }}
      >
        {collapsed ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "90%",
              justifyContent: "center",
            }}
          >
            <Image
              src={Images.logoTSE2.src}
              preview={false}
              alt="logo"
              style={{
                height: "40px",
                width: "40px",
                borderRadius: "99px",
              }}
              className="transition-all duration-300"
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "90%",
              justifyContent: "center",
            }}
          >
            <Image
              src={Images.logoTSE2.src}
              preview={false}
              alt="logo"
              style={{
                height: "100px",
                width: "100px",
                borderRadius: "99px",
              }}
              className="transition-all duration-300"
            />
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        theme="light"
        items={menuItems}
        onClick={(info) => {
          route.push(`/${info.key}`);
        }}
        selectedKeys={[`/${pathname.split("/")?.slice(2).join("/")}`]}
        style={{
          minWidth: 0,
          flex: "auto",
          fontSize: "16px",
          fontWeight: 500,
          background: "#120e31",
        }}
      />
    </Sider>
  );
};
