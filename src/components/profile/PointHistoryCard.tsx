import { PointHistoryResponseDto } from "@/constant/types";
import { formatDate } from "@/lib/utils";
import { Card, Table } from "antd";
import { useTranslation } from "next-i18next";
import React from "react";


interface PointHistoryCardProps {
    pointHistorys: PointHistoryResponseDto[];
    currentPointHistoryPage: number;
    totalCountPointHistorys: number;
    setCurrentPointHistoryPage: (page: number) => void;
    loadingPointHistorys: boolean;
    pageSizePointHistorys: number;
}

export const PointHistoryCard = (props: PointHistoryCardProps) => {
  const { t } = useTranslation("common");
  const pointHistoryInfoColumns = [
      
      {
        title: "Thời điểm cập nhật",
        dataIndex: "resetTime",
        key: "resetTime",
        render: (_: any, record: PointHistoryResponseDto) =>
          formatDate(record.resetTime)?.formattedDate,
      },
      {
        title: "Loại điểm",
        dataIndex: "pointType",
        key: "pointType",
        render: (_: any, record: PointHistoryResponseDto) =>
          t(record.pointType === "CONTRIBUTION" ? "Contribution Point" : "Attendance Point"),
      },
      {
        title: "Điểm số",
        dataIndex: "point",
        key: "point",
      },
    ];
  return (
    <Card className="shadow rounded-2xl">
      <h3 className="font-bold text-blue-900 mb-4 text-xl">
        {t("Point History")}
      </h3>
      <Table
        columns={pointHistoryInfoColumns}
        dataSource={props.pointHistorys}
        rowKey="id"
        pagination={{
          pageSize: props.pageSizePointHistorys,
          current: props.currentPointHistoryPage,
          total: props.totalCountPointHistorys,
          onChange: props.setCurrentPointHistoryPage,
        }}
        loading={props.loadingPointHistorys}
      />
    </Card>
  );
};
