# Day 17: Reports/Dashboard

## Mục tiêu
Xây dựng Dashboard với charts và statistics.

## Dashboard Page - `src/app/(dashboard)/dashboard/page.tsx`

```typescript
"use client";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { formatCurrency } from "@/utils/format";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MOCK_STATS = {
  totalRevenue: 1250000000,
  totalOrders: 156,
  totalProducts: 89,
  totalCustomers: 234,
  growthRate: 15.5,
};

const MOCK_CHART_DATA = {
  orderGrowth: {
    series: [{ name: "Orders", data: [65, 78, 90, 81, 96, 105, 120, 115, 130, 145, 160, 175] }],
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  topProducts: {
    labels: ["iPhone 15 Pro Max", "MacBook Pro M3", "Samsung S24 Ultra", "Sony WH-1000XM5", "iPad Pro"],
    data: [35, 25, 20, 12, 8],
  },
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(MOCK_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const orderGrowthOptions = {
    chart: { type: "area" as const, toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2 } },
    dataLabels: { enabled: false },
    xaxis: { categories: MOCK_CHART_DATA.orderGrowth.categories },
    colors: ["#0f172a"],
    theme: { mode: "light" },
  };

  const topProductsOptions = {
    chart: { type: "donut" as const, fontFamily: "Inter, sans-serif" },
    labels: MOCK_CHART_DATA.topProducts.labels,
    colors: ["#0f172a", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
    legend: { position: "bottom" as const },
    dataLabels: { enabled: false },
  };

  const StatCard = ({ title, value, icon, color, trend }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</h3>
          {trend && <p className={`text-sm mt-1 ${trend >= 0 ? "text-success-500" : "text-danger-500"}`}>{trend > 0 ? "+" : ""}{trend}%</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon icon={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("dashboard.title")}</h1>
        <button className="btn btn-outline-dark btn-sm"><Icon icon="heroicons:arrow-path" className="ltr:mr-2" />{t("common.refresh")}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t("dashboard.totalRevenue")} value={formatCurrency(stats.totalRevenue)} icon="heroicons:banknotes" color="bg-primary-500" trend={15.5} />
        <StatCard title={t("dashboard.totalOrders")} value={stats.totalOrders} icon="heroicons:shopping-cart" color="bg-success-500" trend={8.2} />
        <StatCard title={t("dashboard.totalProducts")} value={stats.totalProducts} icon="heroicons:cube" color="bg-warning-500" trend={-2.1} />
        <StatCard title={t("dashboard.totalCustomers")} value={stats.totalCustomers} icon="heroicons:users" color="bg-info-500" trend={12.8} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t("dashboard.orderGrowthReport")}>
          <div className="h-80">
            {!loading && <Chart options={orderGrowthOptions} series={MOCK_CHART_DATA.orderGrowth.series} type="area" height="100%" />}
          </div>
        </Card>

        <Card title={t("dashboard.topBestSellingProducts")}>
          <div className="h-80">
            {!loading && <Chart options={topProductsOptions} series={MOCK_CHART_DATA.topProducts.data} type="donut" height="100%" />}
          </div>
        </Card>
      </div>

      <Card title={t("dashboard.recentActivity")}>
        <div className="space-y-4">
          {[
            { icon: "heroicons:shopping-bag", text: "New order #ORD-2024-156 received", time: "5 minutes ago", color: "bg-primary-500" },
            { icon: "heroicons:user-plus", text: "New customer registered: Nguyen Van A", time: "15 minutes ago", color: "bg-success-500" },
            { icon: "heroicons:exclamation-triangle", text: "Low stock alert: iPhone 15 Pro Max", time: "1 hour ago", color: "bg-warning-500" },
            { icon: "heroicons:check-circle", text: "Payment received for order #ORD-2024-155", time: "2 hours ago", color: "bg-success-500" },
          ].map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center flex-shrink-0`}>
                <Icon icon={activity.icon} className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-slate-800 dark:text-slate-200">{activity.text}</p>
                <p className="text-sm text-slate-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
```

## Checklist
- [ ] Statistics cards với trend indicators
- [ ] Order growth chart (Area chart)
- [ ] Top products chart (Donut chart)
- [ ] Recent activity list

## Liên kết
- [Day 18: i18n Integration](./day-18.md) - Tiếp theo
