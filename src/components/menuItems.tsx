"use client";

import { UserRole } from "@/constant/types";
import {
  BookOutlined,
  CalendarOutlined,
  CodeSandboxOutlined,
  DatabaseOutlined,
  FileImageOutlined,
  FileOutlined,
  GroupOutlined,
  HomeOutlined,
  MailOutlined,
  OrderedListOutlined,
  SettingOutlined,
  UserDeleteOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { ItemType, MenuItemType } from "antd/es/menu/interface";

export type MenuItem = ItemType & {
  path?: string;
  permissionKey?: string;
  parent?: string;
  children?: MenuItem[];
  label?: string;
};
interface CustomMenuItem extends MenuItemType {
  label: string;
  key: string;
  icon?: React.ReactNode;
  children?: CustomMenuItem[];
  path?: string;
  permissionKey?: string;
  parent?: string;
  requiredRole?: UserRole[];
}
export const settingItems: CustomMenuItem[] = [
  {
    key: "/settings",
    label: "Settings",
  },
];

export const postItems: CustomMenuItem[] = [
  {
    key: "/posts",
    label: "Posts",
  },
  {
    key: "/posts/create",
    label: "Create Post",
  },
];

export const mediaItems: CustomMenuItem[] = [
  {
    key: "/media",
    label: "Media",
  },
  {
    key: "/media/create",
    label: "Upload Media",
  },
];

export const eventItems: CustomMenuItem[] = [
  {
    key: "events",
    label: "Events",
  },
  {
    key: "training",
    label: "Training Courses",
  },
];

export const memberItems: CustomMenuItem[] = [
  {
    key: "members",
    label: "Members List",
  },
  {
    key: "member-update-requests",
    label: "Member Update Requests",
    requiredRole: [UserRole.LEADER, UserRole.ADMIN],
  },
];

export const menuItems: Array<CustomMenuItem> = [
  { label: "Dashboard", key: "", icon: <HomeOutlined /> },
  {
    label: "Members",
    key: "members",
    icon: <UsergroupAddOutlined />,
    children: memberItems,
  },
  {
    label: "Events",
    key: "events",
    icon: <CalendarOutlined />,
    children: eventItems,
  },
  // {
  //   label: "Categories, Tags",
  //   key: "categories",
  //   icon: <DatabaseOutlined />,
  //   children: categoriesTagsItems,
  // },
  {
    label: "Posts",
    key: "posts",
    icon: <FileOutlined />,
  },

  {
    label: "Media",
    key: "media",
    icon: <FileImageOutlined />,
  },

  {
    label: "Profile",
    key: "profile",
    icon: <UserDeleteOutlined />,
  },
  // {
  //   label: "Settings",
  //   key: "settings",
  //   icon: <SettingOutlined />,
  //   children: settingItems,
  // },
  // {
  //   label: "Contact Form",
  //   key: "contactform",
  //   icon: <MailOutlined />,
  //   children: contactForm,
  // },
  // {
  //   label: "General Setting",
  //   key: "general-setting",
  //   icon: <CodeSandboxOutlined />,
  // },
  // {
  //   label: "Base System",
  //   key: "base-system",
  //   icon: <ApartmentOutlined />,
  //   children: baseItems,
  //   permissionKey: "base-system",
  // },
];

const filterMenuItemsByRoleRecursive = (
  menuItems: CustomMenuItem[],
  userRole: UserRole
): CustomMenuItem[] => {
  return menuItems.reduce<CustomMenuItem[]>((filteredMenuItems, item) => {
    // 1. Kiểm tra quyền truy cập cho mục hiện tại
    const isAccessible = !item.requiredRole || item.requiredRole.includes(userRole);

    if (isAccessible) {
      // 2. Nếu mục có children, dùng đệ quy để lọc chúng
      if (item.children) {
        const filteredChildren = filterMenuItemsByRoleRecursive(
          item.children,
          userRole
        );

        // 3. Chỉ thêm mục cha nếu nó có mục con hợp lệ (hoặc không có mục con)
        if (filteredChildren.length > 0) {
          filteredMenuItems.push({
            ...item,
            children: filteredChildren,
          });
        }
        // Trường hợp không có mục con: Nếu đây là menu cha nhưng không có requiredRole
        // và tất cả các con bị lọc hết, ta sẽ bỏ qua mục cha này.
      } else {
        // 4. Mục đơn (không có children) và đã vượt qua kiểm tra quyền truy cập, thêm vào
        filteredMenuItems.push(item);
      }
    }

    return filteredMenuItems;
  }, []);
};

export const getFilteredMenuItems = (): MenuItem[] => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole: UserRole = user?.role || UserRole.NONE;
  

  // Lọc menu items dựa trên vai trò người dùng
  const filteredMenuItems = filterMenuItemsByRoleRecursive(menuItems, userRole);
  return filteredMenuItems;
};
