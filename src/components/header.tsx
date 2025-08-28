import { Images } from "@/constant/image";
import { isLogin } from "@/lib/actions/auth";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Image, Menu, notification, Select } from "antd";
import { Header } from "antd/es/layout/layout";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface HeaderCMSProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userAvatar: string | null;
}

function HeaderCMS({ collapsed, setCollapsed, userAvatar }: HeaderCMSProps) {
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentLang =
    searchParams.get("lang") || localStorage.getItem("lang") || "en";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    notification.success({
      message: t("Logout successful"),
      description: t("You have successfully logged out."),
      placement: "topRight",
    });
    router.push("/signin");
  };
  const changeLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);

    const params = new URLSearchParams(searchParams);
    params.set("lang", newLang);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    localStorage.setItem("lang", currentLang);
    i18n.changeLanguage(currentLang);
  }, [currentLang]);

  useEffect(() => {
    async function checkLoginStatus() {
      const loggedIn = await isLogin();
      const isAccountLoggedIn = localStorage.getItem("user");
      if (loggedIn || isAccountLoggedIn) {
        setIsLoggedIn(true);
      }
    }
    checkLoginStatus();
  }, []);

  const handleUserMenuClick = () => {
    setUserMenuOpen((prev) => !prev);
  };

  const handleProfileClick = () => {
    router.push("/admin/profile");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      userMenuRef.current &&
      !userMenuRef.current.contains(event.target as Node)
    ) {
      setUserMenuOpen(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, []);

  return (
    <Header className="!bg-white p-0 flex justify-between">
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="!text-[20px] w-[64px] h-[64px] p-3"
        />
        <Image
          src={Images.logoIUH.src}
          alt=""
          width={120}
          height={50}
          preview={false}
          className="pl-3"
        />
      </div>
      <div
        className="relative flex items-center pr-[30px] gap-4"
        ref={userMenuRef}
      >
        <Select
          defaultValue={i18n.language}
          value={i18n.language}
          onChange={changeLanguage}
          className="min-w-24"
        >
          <Select.Option value="vi">Tiếng Việt</Select.Option>
          <Select.Option value="en">English</Select.Option>
        </Select>
        <Image
          preview={false}
          className="w-8 h-8 rounded-full border-2 border-indigo-400 cursor-pointer"
          src={`/default-image.jpg`}
          alt="User Avatar"
          onClick={handleUserMenuClick}
          width={32}
          height={32}
        />

        {isUserMenuOpen && (
          <Menu
            mode="vertical"
            className="menu-dropdown z-50 absolute right-3 top-full shadow-lg drop-shadow-md px-2 py-1 "
            onClick={handleUserMenuClick}
          >
            <Menu.Item key="profile" onClick={handleProfileClick}>
              {t("Profile")}
            </Menu.Item>
            <Menu.Item key="logout" onClick={handleLogout}>
              {t("Logout")}
            </Menu.Item>
          </Menu>
        )}
      </div>
    </Header>
  );
}

export default HeaderCMS;
