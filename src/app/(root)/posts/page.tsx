"use client";

import ListPost from "@/modules/post/ListPost";
import { Button, Input } from "antd";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function PostPage() {
  const { t } = useTranslation("common");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-[85vh] bg-white flex flex-col items-center justify-start rounded-lg shadow-sm gap-4 px-4 pt-10">
      <div className="flex justify-between w-full">
        <h1 className="ml-[10px] text-3xl font-bold">{t("List Posts")}</h1>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={t("Find post...")}
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-2 rounded-md border border-gray-300 dark:border-gray-600 w-[300px]"
          />
          <Button variant="outlined" className="h-[36px]">
            <Search className="text-gray-600" />
          </Button>

          <Link href="/posts/create">
            <Button variant="filled" className="h-[36px]">
              {t("Create Post")}
            </Button>
          </Link>
        </div>
      </div>

      <ListPost searchTerm={searchTerm} />
    </div>
  );
}
