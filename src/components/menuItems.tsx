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

export const orderItems: CustomMenuItem[] = [
  {
    key: "/orders",
    label: "Orders",
  },
  {
    key: "/orders/create",
    label: "Create Order",
  },
];

export const categoriesTagsItems: CustomMenuItem[] = [
  {
    key: "/categories",
    label: "Categories",
  },
  {
    key: "/tags",
    label: "Tags",
  },
];

export const menuItems: Array<CustomMenuItem> = [
  { label: "Dashboard", key: "", icon: <HomeOutlined /> },
  {
    label: "Members",
    key: "members",
    icon: <UsergroupAddOutlined />,
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

const filterMenuItemsByPermission = (
  menuItems: MenuItem[],
  permissions: Record<
    string,
    { find?: { enabled: boolean }; create?: { enabled: boolean } }
  >
): MenuItem[] => {
  return menuItems.reduce<MenuItem[]>((filteredMenuItems, item) => {
    const permissionKey = item.permissionKey;

    if (permissionKey) {
      const hasPermission = permissions[permissionKey]?.find?.enabled === true;

      if (hasPermission) {
        if (item.children?.length) {
          const filteredChildren = item.children?.filter((child) => {
            const path = child.key?.toString() || "";

            if (path.includes("/create")) {
              return permissions[permissionKey]?.create?.enabled === true;
            }
            return true;
          });

          if (filteredChildren?.length) {
            filteredMenuItems.push({
              ...item,
              children: filteredChildren,
            });
          }
        } else {
          filteredMenuItems.push(item);
        }
      }
    } else {
      filteredMenuItems.push(item);
    }

    return filteredMenuItems;
  }, []);
};

export const getFilteredMenuItems = (): MenuItem[] => {
  // const permissions = JSON.parse(localStorage.getItem("permissions") || "{}");
  // const filteredMenuItems = filterMenuItemsByPermission(
  //   menuItems,
  //   permissions
  // );
  return menuItems;
};
