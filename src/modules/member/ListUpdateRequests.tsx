"use client";

import { PageWrapperDto, SearchDto, UserUpdateFormDto } from "@/constant/types";
import { decodeBitwiseUserTypeToLabels, formatDate, isLeader } from "@/lib/utils";
import { Table } from "antd";
import React from "react";
import { leaderApproveUserRequestUpdateInfo, leaderGetUserRequestUpdateInfo } from "../services/userService";
import { useTranslation } from "next-i18next";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface ListUpdateRequestsProps {
  searchTerm: SearchDto;
  reloadToggle?: boolean;
}

const ListUpdateRequests: React.FC<ListUpdateRequestsProps> = ({
  searchTerm,
  reloadToggle = false,
}) => {
  const { t } = useTranslation("common");
  const leader = isLeader();
  const [listUpdateRequests, setListUpdateRequests] = React.useState<
    UserUpdateFormDto[]
  >([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [currentPage, setCurrentPage] = React.useState<number>(
    searchTerm.page || 1
  );
  const [total, setTotal] = React.useState<number>(0);

  React.useLayoutEffect(() => {
    if (leader) {
      fetchLeaderGetUserRequestUpdateInfo();
    }
  }, [searchTerm, reloadToggle]);

  const fetchLeaderGetUserRequestUpdateInfo = async () => {
    setLoading(true);
    try {
      const response = (await leaderGetUserRequestUpdateInfo({
        ...searchTerm,
        page: currentPage - 1,
      })) as PageWrapperDto;
      // console.log("response", response);
      setListUpdateRequests(
        response._embedded ? response._embedded.userUpdateFormDtoList : []
      );
      setTotal(response.page.totalElements);
    } catch (error) {
      console.error("Failed to fetch update requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderChangeData = (oldData: string, newData: string) => {
    return (
      <div className="flex items-center space-x-2">
        {/* Dữ liệu cũ (hiển thị màu xám hoặc ít nổi bật hơn) */}
        <span className="text-gray-500 line-through">{oldData}</span>

        {/* Mũi tên */}
        <span className="text-blue-500 font-bold">→</span>

        {/* Dữ liệu mới (nổi bật hơn) */}
        <span className="text-green-600 font-semibold">{newData}</span>
      </div>
    );
  }

  const handleApproveRequest = (requestId: string,isApproved: boolean) => {
    leaderApproveUserRequestUpdateInfo(requestId,{isApproved})
      .then((res) => {
        if (res instanceof AxiosError){
          toast.error( res.response?.data.detail ||t("Failed to process the request."));
          return;
        }
        toast.success(t("Request processed successfully."));
        fetchLeaderGetUserRequestUpdateInfo();
      })
      .catch((error) => {
        console.error("Failed to approve request:", error);
      });
  }

  const columns = [
    
    {
      title: t("User Name"),
      dataIndex: ["user", "name"],
      key: "userName",
      render: (_: any, record: UserUpdateFormDto) => record.user.fullName,
    },
    {
      title: t("Created At"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: string) => {
        const formattedDate = formatDate(text);
        return <span>{formattedDate.formattedDate}</span>;
      },
    },
    {
      title: t("Email"),
      dataIndex: "email",
      key: "email",
      render: (_: any, record: UserUpdateFormDto) => {
        const oldEmail = record.user.email;
        const newEmail = record.email;
        const isChanged = oldEmail !== newEmail && newEmail;

        if (isChanged) {
          return (
            renderChangeData(oldEmail || "N/A", newEmail || "N/A")
          );
        }
        return (
          <div className="text-gray-800">{oldEmail || newEmail || "N/A"}</div>
        );
      },
    },
    {
      title: t("User Type"),
      dataIndex: "type",
      key: "type",
      render: (_: any, record: UserUpdateFormDto) => {
        const oldType = record.user.type?.toString() || "N/A";
        const oldTypeDisplay = decodeBitwiseUserTypeToLabels(record.user.type).join(", ") || "N/A";
        const newType = record.type?.toString() || "N/A";
        const newTypeDisplay = decodeBitwiseUserTypeToLabels(record.type).join(", ") || "N/A";
        const isChanged = oldType !== newType && newType;

        if (isChanged) {
          return (
            renderChangeData(oldTypeDisplay, newTypeDisplay)
          );
        }
        return (
          <div className="text-gray-800">{oldTypeDisplay || newTypeDisplay}</div>
        );
      }
    },
    {
      title: t("Actions"),
      key: "actions",
      render: (_: any, record: UserUpdateFormDto) => (
        <div className="flex space-x-2 gap-3">
          <button
            onClick={() => handleApproveRequest(record.id,true)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700 hover:text-white transition-colors duration-200"
            style={{
              color:"white"
            }}
          >
            {t("Approve")}
          </button>
          <button
            onClick={() => handleApproveRequest(record.id,false)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 hover:text-white  transition-colors duration-200"
            style={{
              color:"white"
            }}
          >
            {t("Reject")}
          </button>
        </div>
      ),
    }
    
  ];
  return (
    <div className="w-full mt-5 overflow-x-auto">
      <Table
        columns={columns}
        dataSource={listUpdateRequests}
        loading={loading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: searchTerm.size,
          total: total,
          onChange: (page) => {
            setCurrentPage(page);
          },
        }}
      />
    </div>
  );
};

export default ListUpdateRequests;
