"use client";
import React, { useMemo } from "react";
import { teamData } from "@/constant/table-data";
import Icon from "@/components/ui/Icon";
import Dropdown from "@/components/ui/Dropdown";
import { MenuItem } from "@headlessui/react";
import dynamic from "next/dynamic";
import { colors } from "@/constant/data";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
  Column,
  CellProps,
} from "react-table";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CustomerData {
  image: string;
  name: string;
}

interface TableData {
  customer: CustomerData;
  status: string;
  time: string;
  chart: string;
  action: string;
}

const series = [
  {
    data: [800, 600, 1000, 800, 600, 1000, 800, 900],
  },
];

const options: ApexCharts.ApexOptions = {
  chart: {
    toolbar: {
      autoSelected: "pan",
      show: false,
    },
    offsetX: 0,
    offsetY: 0,
    zoom: {
      enabled: false,
    },
    sparkline: {
      enabled: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  colors: [colors.primary],
  tooltip: {
    theme: "light",
  },
  grid: {
    show: false,
    padding: {
      left: 0,
      right: 0,
    },
  },
  yaxis: {
    show: false,
  },
  fill: {
    type: "solid",
    opacity: [0.1],
  },
  legend: {
    show: false,
  },
  xaxis: {
    offsetX: 0,
    offsetY: 0,
    labels: {
      offsetX: 0,
      show: false,
    },
    axisBorder: {
      offsetX: 0,
      show: false,
    },
  },
};

interface ActionItem {
  name: string;
  icon: string;
}

const actions: ActionItem[] = [
  {
    name: "view",
    icon: "heroicons-outline:eye",
  },
  {
    name: "edit",
    icon: "heroicons:pencil-square",
  },
  {
    name: "delete",
    icon: "heroicons-outline:trash",
  },
];

const COLUMNS: Column<TableData>[] = [
  {
    Header: "assignee",
    accessor: "customer",
    Cell: (row: CellProps<TableData>) => {
      return (
        <span className="flex items-center min-w-[150px]">
          <span className="w-8 h-8 rounded-full ltr:mr-3 rtl:ml-3 flex-none">
            <img
              src={row?.cell?.value.image}
              alt={row?.cell?.value.name}
              className="object-cover w-full h-full rounded-full"
            />
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">
            {row?.cell?.value.name}
          </span>
        </span>
      );
    },
  },
  {
    Header: "status",
    accessor: "status",
    Cell: (row: CellProps<TableData>) => {
      return (
        <span className="block min-w-[140px] text-left">
          <span className="inline-block text-center mx-auto py-1">
            {row?.cell?.value === "progress" && (
              <span className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="h-[6px] w-[6px] bg-danger-500 rounded-full inline-block ring-4 ring-opacity-30 ring-danger-500"></span>
                <span>In progress</span>
              </span>
            )}
            {row?.cell?.value === "complete" && (
              <span className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="h-[6px] w-[6px] bg-success-500 rounded-full inline-block ring-4 ring-opacity-30 ring-success-500"></span>
                <span>Complete</span>
              </span>
            )}
          </span>
        </span>
      );
    },
  },
  {
    Header: "time",
    accessor: "time",
    Cell: (row: CellProps<TableData>) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "chart",
    accessor: "chart",
    Cell: () => {
      return (
        <span>
          <Chart options={options} series={series} type="area" height={48} />
        </span>
      );
    },
  },
  {
    Header: "action",
    accessor: "action",
    Cell: () => {
      return (
        <div className=" text-center">
          <Dropdown
            classMenuItems="right-0 w-[140px] top-[110%] "
            label={
              <span className="text-xl text-center block w-full">
                <Icon icon="heroicons-outline:dots-vertical" />
              </span>
            }>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {actions.map((item, i) => (
                <MenuItem key={i}>
                  <div
                    className={`
                  ${
                    item.name === "delete"
                      ? "bg-danger-500/30 text-danger-500 hover:bg-danger-500 hover:text-white"
                      : "hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600/50"
                  }
                   w-full border-b border-b-gray-500/10 px-4 py-2 text-sm  last:mb-0 cursor-pointer 
                   first:rounded-t last:rounded-b flex  space-x-2 items-center rtl:space-x-reverse `}>
                    <span className="text-base">
                      <Icon icon={item.icon} />
                    </span>
                    <span>{item.name}</span>
                  </div>
                </MenuItem>
              ))}
            </div>
          </Dropdown>
        </div>
      );
    },
  },
];

const TeamTable= () => {
  const columns = useMemo(() => COLUMNS, []);
  const data = useMemo(() => teamData as TableData[], []);

  const tableInstance = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: 6,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
  );

  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow } =
    tableInstance;

  return (
    <>
      <div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden ">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700!"
                {...getTableProps()}>
                <thead className="bg-slate-100 dark:bg-slate-700">
                  {headerGroups.map((headerGroup) => {
                    const { key: headerGroupKey, ...restHeaderGroupProps } =
                      headerGroup.getHeaderGroupProps();
                    return (
                      <tr key={headerGroupKey} {...restHeaderGroupProps}>
                        {headerGroup.headers.map((column) => {
                          const { key: columnKey, ...restColumnProps } =
                            column.getHeaderProps(
                              column.getSortByToggleProps(),
                            );
                          return (
                            <th
                              key={columnKey}
                              {...restColumnProps}
                              scope="col"
                              className="table-th">
                              {column.render("Header")}
                              <span>
                                {column.isSorted
                                  ? column.isSortedDesc
                                    ? " 🔽"
                                    : " 🔼"
                                  : ""}
                              </span>
                            </th>
                          );
                        })}
                      </tr>
                    );
                  })}
                </thead>
                <tbody
                  className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700!"
                  {...getTableBodyProps()}>
                  {page.map((row) => {
                    prepareRow(row);
                    const { key: rowKey, ...restRowProps } = row.getRowProps();
                    return (
                      <tr key={rowKey} {...restRowProps}>
                        {row.cells.map((cell) => {
                          const { key: cellKey, ...restCellProps } =
                            cell.getCellProps();
                          return (
                            <td
                              key={cellKey}
                              {...restCellProps}
                              className="table-td py-2">
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamTable;
