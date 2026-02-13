"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import Link from "next/link";
import { MenuItem } from "@headlessui/react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  targetUrl: string | null;
  createdOnUtc: string;
}

const Notification= () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Mock data for notifications
  const mockNotifications = useMemo<NotificationItem[]>(() => [
    {
      id: "1",
      title: "Đơn hàng mới #12345",
      message: "Bạn có một đơn hàng mới từ khách hàng Nguyễn Văn A",
      isRead: false,
      targetUrl: "/orders/12345",
      createdOnUtc: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    {
      id: "2",
      title: "Sản phẩm sắp hết hàng",
      message: "Sản phẩm 'iPhone 15 Pro Max' chỉ còn 5 chiếc trong kho",
      isRead: false,
      targetUrl: "/inventory",
      createdOnUtc: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    },
    {
      id: "3",
      title: "Khuyến mãi đã được phê duyệt",
      message: "Mã giảm giá 'SUMMER2024' đã được phê duyệt và sẵn sàng sử dụng",
      isRead: true,
      targetUrl: "/discounts",
      createdOnUtc: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: "4",
      title: "Đánh giá mới từ khách hàng",
      message: "Khách hàng Trần Thị B vừa đánh giá 5 sao cho sản phẩm AirPods Pro",
      isRead: true,
      targetUrl: "/products",
      createdOnUtc: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: "5",
      title: "Cập nhật hệ thống",
      message: "Hệ thống sẽ được bảo trì vào lúc 2:00 AM ngày mai",
      isRead: true,
      targetUrl: null,
      createdOnUtc: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
  ], []);

  // Fetch notifications and unread count (using mock data)
  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Use mock data instead of API call
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [mockNotifications]);

  useEffect(() => {
    fetchNotifications();

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  // Format time ago
  const formatTimeAgo = (dateString: string | null | undefined): string => {
    if (!dateString) return t("notification.justNow");

    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t("notification.justNow");
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return t("notification.minutesAgo", { count: diffInMinutes });
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return t("notification.hoursAgo", { count: diffInHours });
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return t("notification.daysAgo", { count: diffInDays });
  };

  // Handle notification click
  const handleNotificationClick = async (notification: NotificationItem): Promise<void> => {
    try {
      // Mark as read locally (mock behavior - no API call)
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));

      // Navigate if targetUrl exists
      if (notification.targetUrl) {
        router.push(notification.targetUrl);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const notifyLabel = (): React.ReactElement => {
    return (
      <span className="relative lg:h-[32px] lg:w-[32px] lg:bg-slate-100 text-slate-900 lg:dark:bg-slate-900 dark:text-white cursor-pointer rounded-full text-[20px] flex flex-col items-center justify-center">
        <Icon icon="heroicons-outline:bell" className="animate-tada" />
        {unreadCount > 0 && (
          <span className="absolute lg:right-0 lg:top-0 -top-2 -right-2 h-4 w-4 bg-red-500 text-[8px] font-semibold flex flex-col items-center justify-center rounded-full text-white z-99">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </span>
    );
  };

  return (
    <Dropdown classMenuItems="md:w-[300px] top-[58px]" label={notifyLabel()}>
      <div className="flex justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-600">
        <div className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-6">
          {t("notification.title")}
        </div>
        <div className="text-slate-800 dark:text-slate-200 text-xs md:text-right">
          <Link href="/notifications" className="underline">
            {t("notification.viewAll")}
          </Link>
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {loading ? (
          <div className="px-4 py-8 text-center">
            <Icon
              icon="heroicons:arrow-path"
              className="animate-spin text-2xl text-slate-400 mx-auto mb-2"
            />
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              {t("common.loading")}
            </span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              {t("notification.noNotifications")}
            </span>
          </div>
        ) : (
          notifications.map((item, i) => (
            <MenuItem key={i}>
              {({ active }: { active: boolean }) => (
                <div
                  className={`${
                    active
                      ? "bg-slate-100 dark:bg-slate-700 dark:bg-opacity-70 text-slate-800"
                      : "text-slate-600 dark:text-slate-300"
                  } block w-full px-4 py-2 text-sm cursor-pointer`}
                  onClick={() => handleNotificationClick(item)}
                >
                  <div className="flex ltr:text-left rtl:text-right">
                    <div className="flex-none ltr:mr-3 rtl:ml-3">
                      <div className="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <Icon
                          icon="heroicons:bell"
                          className={`${
                            active
                              ? "text-slate-600 dark:text-slate-300"
                              : "text-slate-500 dark:text-slate-400"
                          } text-lg`}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div
                        className={`${
                          active
                            ? "text-slate-800 dark:text-slate-200"
                            : "text-slate-600 dark:text-slate-300"
                        } text-sm font-medium`}
                      >
                        {item.title}
                      </div>
                      <div
                        className={`${
                          active
                            ? "text-slate-600 dark:text-slate-300"
                            : "text-slate-500 dark:text-slate-400"
                        } text-xs leading-4 mt-1 line-clamp-2`}
                      >
                        {item.message}
                      </div>
                      <div className="text-slate-400 dark:text-slate-400 text-xs mt-1">
                        {formatTimeAgo(item.createdOnUtc)}
                      </div>
                    </div>
                    {!item.isRead && (
                      <div className="flex-0">
                        <span className="h-[10px] w-[10px] bg-danger-500 border border-white dark:border-slate-400 rounded-full inline-block"></span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </MenuItem>
          ))
        )}
      </div>
    </Dropdown>
  );
};

export default Notification;
