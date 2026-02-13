"use client";

import React, { Fragment } from "react";
import { Menu, MenuItem } from "@headlessui/react";
import Card from "@/components/ui/Card";
import { notifications } from "@/constant/data";
import Image from "next/image";

const NotificationPage= () => {
  return (
    <div>
      <Card bodyClass="p-0">
        <div className="flex justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-600">
          <div className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-6">
            All Notifications
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <Menu as={Fragment}>
            {notifications?.map((item, i) => (
              <MenuItem key={i}>
                {({ focus }) => (
                  <div
                    className={`${
                      focus
                        ? "bg-slate-100 dark:bg-slate-700 dark:bg-opacity-70 text-slate-800"
                        : "text-slate-600 dark:text-slate-300"
                    } block w-full px-4 py-2 text-sm cursor-pointer`}
                  >
                    <div className="flex ltr:text-left rtl:text-right">
                      <div className="flex-none ltr:mr-3 rtl:ml-3">
                        <div className="h-8 w-8 bg-white rounded-full">
                          <Image
                            src={item.image}
                            alt={item.title}
                            className={`${
                              focus ? "border-white" : "border-transparent"
                            } block w-full h-full object-cover rounded-full border`}
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          {item.title}
                        </div>
                        <div className="text-xs leading-4 text-slate-600 dark:text-slate-300">
                          {item.desc}
                        </div>
                        <div className="text-slate-400 dark:text-slate-400 text-xs mt-1">
                          3 min ago
                        </div>
                      </div>

                      {item.unread && (
                        <div className="flex-0">
                          <span className="h-[10px] w-[10px] bg-danger-500 border border-white dark:border-slate-400 rounded-full inline-block"></span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </MenuItem>
            ))}
          </Menu>
        </div>
      </Card>
    </div>
  );
};

export default NotificationPage;
