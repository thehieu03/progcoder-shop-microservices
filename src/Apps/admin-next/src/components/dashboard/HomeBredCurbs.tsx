"use client";
import React from "react";
// import { useTranslation } from "react-i18next"; // Unused in render
// import { DateRangePicker, Calendar } from "react-date-range"; // Unused in render

const HomeBredCurbs = ({ title }: { title: string }) => {
  // const { t } = useTranslation();
  return (
    <div className="flex justify-between flex-wrap items-center gap-6 mb-6">
      <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
        {title}
      </h4>
    </div>
  );
};

export default HomeBredCurbs;
