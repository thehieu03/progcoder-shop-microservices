"use client";
import React, { useState, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { reportService } from "@/core/services/reportService";
import { useTranslation } from "react-i18next";

interface StatisticItem {
  id?: string;
  title: string;
  count: string;
  bg: string;
  text: string;
  icon: string;
}

interface DashboardData {
  growth?: number;
  productsSold?: number;
  totalRevenue?: number;
  totalUsers?: number;
}

interface GroupChart2Props {
  onRefresh?: (refreshFn: () => Promise<void>) => void;
}

const GroupChart2: React.FC<GroupChart2Props> = ({ onRefresh }) => {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState<StatisticItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const transformDashboardData = (data: DashboardData): StatisticItem[] => {
    return [
      {
        id: "growth",
        title: t("dashboard.growth"),
        count: `${data.growth || 0}%`,
        bg: "bg-indigo-500",
        text: "text-indigo-500",
        icon: "heroicons:chart-bar",
      },
      {
        id: "productsSold",
        title: t("dashboard.productsSold"),
        count: (data.productsSold || 0).toLocaleString(),
        bg: "bg-emerald-500",
        text: "text-emerald-500",
        icon: "heroicons:shopping-bag",
      },
      {
        id: "totalRevenue",
        title: t("dashboard.totalRevenue"),
        count: `$${(data.totalRevenue || 0).toLocaleString()}`,
        bg: "bg-amber-500",
        text: "text-amber-500",
        icon: "heroicons:currency-dollar",
      },
      {
        id: "totalUsers",
        title: t("dashboard.totalUsers"),
        count: (data.totalUsers || 0).toLocaleString(),
        bg: "bg-blue-500",
        text: "text-blue-500",
        icon: "heroicons:users",
      },
    ];
  };

  const fetchDashboardStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await reportService.getDashboardStatistics();

      // API returns { result: { items: [{ growth, productsSold, totalRevenue, totalUsers }] } }
      if (response?.result?.items?.[0]) {
        const data = transformDashboardData(response.result.items[0]);
        setStatistics(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard statistics:", error);
      // Set empty array on error to prevent UI breaks
      setStatistics([]);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDashboardStatistics();
  }, [fetchDashboardStatistics]);

  // Expose refresh function to parent
  useEffect(() => {
    if (onRefresh) {
      onRefresh(fetchDashboardStatistics);
    }
  }, [onRefresh, fetchDashboardStatistics]);

  // Show loading state
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Card bodyClass="pt-4 pb-3 px-4">
              <div className="flex space-x-3 rtl:space-x-reverse animate-pulse">
                <div className="flex-none">
                  <div className="bg-slate-200 dark:bg-slate-700 h-12 w-12 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </>
    );
  }

  // Show empty state if no data
  if (statistics.length === 0) {
    return (
      <>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Card bodyClass="pt-4 pb-3 px-4">
              <div className="flex space-x-3 rtl:space-x-reverse">
                <div className="flex-none">
                  <div className="bg-slate-200 dark:bg-slate-700 h-12 w-12 rounded-full flex flex-col items-center justify-center text-2xl">
                    <Icon icon="heroicons:chart-bar" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-slate-600 dark:text-slate-300 text-sm mb-1 font-medium">
                    -
                  </div>
                  <div className="text-slate-900 dark:text-white text-lg font-medium">
                    -
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {statistics.map((item, i) => (
        <div key={item.id || i}>
          <Card bodyClass="pt-4 pb-3 px-4">
            <div className="flex space-x-3 rtl:space-x-reverse">
              <div className="flex-none">
                <div
                  className={`${item.bg} ${item.text} h-12 w-12 rounded-full flex flex-col items-center justify-center text-2xl`}
                >
                  <Icon icon={item.icon} />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-slate-600 dark:text-slate-300 text-sm mb-1 font-medium">
                  {item.title}
                </div>
                <div className="text-slate-900 dark:text-white text-lg font-medium">
                  {item.count}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </>
  );
};

export default GroupChart2;
