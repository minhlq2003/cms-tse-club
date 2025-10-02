"use client";

import { Drawer, Menu } from "antd";
import { useEffect, useState } from "react";
import { getFilteredMenuItems, MenuItem } from "./menuItems";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faHome,
  faUser,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function MobileNav() {
  const { t } = useTranslation("common");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
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
  }, [originalMenuItems, t]);

  if (!menuItems) return <div> Đang load menu</div>;

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  return (
    <>
      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-2 z-50">
        <button onClick={toggleDrawer} className="flex flex-col items-center">
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
        <button
          onClick={() => router.push("/profile")}
          className="flex flex-col items-center"
        >
          <FontAwesomeIcon icon={faUser} size="lg" />
        </button>
        <button
          onClick={() => router.push("/")}
          className="flex flex-col items-center"
        >
          <FontAwesomeIcon icon={faHome} size="lg" />
        </button>
        <button
          onClick={() => router.push("/calendar")}
          className="flex flex-col items-center"
        >
          <FontAwesomeIcon icon={faCalendar} size="lg" />
        </button>
        <button onClick={toggleDrawer} className="flex flex-col items-center">
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
      </div>

      {/* Drawer */}
      <Drawer
        placement="left"
        onClose={toggleDrawer}
        open={drawerOpen}
        width={250}
        className="!bg-[#120e31]"
      >
        <Menu
          mode="inline"
          theme="light"
          items={menuItems}
          onClick={(info) => {
            router.push(`/${info.key}`);
          }}
          selectedKeys={[`/${pathname.split("/")?.slice(2).join("/")}`]}
          style={{
            minWidth: 0,
            flex: "auto",
            fontSize: "13px",
            fontWeight: 500,
            background: "#120e31",
          }}
        />
      </Drawer>
    </>
  );
}
