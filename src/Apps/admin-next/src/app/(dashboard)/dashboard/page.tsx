"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
// import ImageBlock2 from "@/components/partials/widget/block/image-block-2"; // Unused in layout
import GroupChart2 from "@/components/partials/widget/chart/group-chart-2";
import OrderGrowthLineChart from "@/components/partials/widget/chart/order-growth-line-chart";
import TopProductsPieChart from "@/components/partials/widget/chart/top-products-pie-chart";
import HomeBredCurbs from "@/components/dashboard/HomeBredCurbs";

const Dashboard = () => {
  const { t } = useTranslation();
  // const [filterMap, setFilterMap] = useState("usa"); // Unused in render
  const [refreshFunctions, setRefreshFunctions] = useState<any>({
    statistics: null,
    orderGrowth: null,
    topProducts: null,
  });
  const [loadingStates, setLoadingStates] = useState<any>({
    statistics: false,
    orderGrowth: false,
    topProducts: false,
  });

  const handleRefresh = async (key: string) => {
    if (refreshFunctions[key]) {
      setLoadingStates((prev: any) => ({ ...prev, [key]: true }));
      await refreshFunctions[key]();
      setLoadingStates((prev: any) => ({ ...prev, [key]: false }));
    }
  };

  const registerRefresh = (key: string) => (refreshFn: any) => {
    setRefreshFunctions((prev: any) => ({ ...prev, [key]: refreshFn }));
  };

  return (
    <div>
      <HomeBredCurbs title="Ecommerce" />
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className="2xl:col-span-12 lg:col-span-12 col-span-12">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-medium text-slate-900 dark:text-slate-200">
              {t("dashboard.statistics")}
            </h5>
            <Tooltip
              content={t("common.refresh")}
              placement="top"
              arrow
              animation="shift-away">
              <button
                className="action-btn"
                type="button"
                onClick={() => handleRefresh("statistics")}
                disabled={loadingStates.statistics}>
                <Icon
                  icon="heroicons:arrow-path"
                  className={loadingStates.statistics ? "animate-spin" : ""}
                />
              </button>
            </Tooltip>
          </div>
          <div className="grid md:grid-cols-4 grid-cols-1 gap-4">
            <GroupChart2 onRefresh={registerRefresh("statistics")} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className="2xl:col-span-12 lg:col-span-12 col-span-12">
          <Card>
            <div className="flex justify-end mb-4">
              <Tooltip
                content={t("common.refresh")}
                placement="top"
                arrow
                animation="shift-away">
                <button
                  className="action-btn"
                  type="button"
                  onClick={() => handleRefresh("orderGrowth")}
                  disabled={loadingStates.orderGrowth}>
                  <Icon
                    icon="heroicons:arrow-path"
                    className={loadingStates.orderGrowth ? "animate-spin" : ""}
                  />
                </button>
              </Tooltip>
            </div>
            <div className="legend-ring">
              <OrderGrowthLineChart
                height={420}
                onRefresh={registerRefresh("orderGrowth")}
              />
            </div>
          </Card>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="2xl:col-span-12 lg:col-span-12 col-span-12">
          <Card>
            <div className="flex justify-end mb-4">
              <Tooltip
                content={t("common.refresh")}
                placement="top"
                arrow
                animation="shift-away">
                <button
                  className="action-btn"
                  type="button"
                  onClick={() => handleRefresh("topProducts")}
                  disabled={loadingStates.topProducts}>
                  <Icon
                    icon="heroicons:arrow-path"
                    className={loadingStates.topProducts ? "animate-spin" : ""}
                  />
                </button>
              </Tooltip>
            </div>
            <div className="legend-ring">
              <TopProductsPieChart
                height={420}
                onRefresh={registerRefresh("topProducts")}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
