"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

// Define interface for component props
interface HomeBreadcrumbsProps {
  title: string;
}

const HomeBreadcrumbs: React.FC<HomeBreadcrumbsProps> = ({ title }) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectionRange, setSelectionRange] = useState<{
    startDate: Date;
    endDate: Date;
    key: string;
  }>({
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(11)),
    key: "selection",
  });

  const singleSelect = (date: Date): void => {
    setSelectedDate(date);
    console.log(date);
  };

  const handleSelect = (ranges: {
    selection: {
      startDate: Date;
      endDate: Date;
    };
  }): void => {
    setSelectionRange({
      ...selectionRange,
      startDate: ranges.selection.startDate,
      endDate: ranges.selection.endDate,
    });
  };

  return (
    <div className="flex justify-between flex-wrap items-center gap-6 mb-6">
      <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
        {title}
      </h4>
    </div>
  );
};

export default HomeBreadcrumbs;
