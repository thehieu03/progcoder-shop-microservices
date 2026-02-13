# Day 15: Customers Module

## Mục tiêu
Xây dựng Customers Module quản lý khách hàng.

## Customers Component - `src/components/partials/product/customers.tsx`

```typescript
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import Textinput from "@/components/ui/Textinput";
import Modal from "@/components/ui/Modal";
import { useTable, useRowSelect, useSortBy, useGlobalFilter, usePagination } from "react-table";

const MOCK_CUSTOMERS = [
  { id: "1", firstName: "Nguyen", lastName: "Van A", email: "nguyenvana@example.com", phone: "0901234567", orderCount: 15, totalSpent: 523000000, created: "2023-01-15T08:30:00Z" },
  { id: "2", firstName: "Tran", lastName: "Thi B", email: "tranthib@example.com", phone: "0912345678", orderCount: 8, totalSpent: 189000000, created: "2023-03-20T14:20:00Z" },
  { id: "3", firstName: "Le", lastName: "Van C", email: "levanc@example.com", phone: "0923456789", orderCount: 23, totalSpent: 892000000, created: "2022-11-10T09:15:00Z" },
  { id: "4", firstName: "Pham", lastName: "Thi D", email: "phamthid@example.com", phone: "0934567890", orderCount: 3, totalSpent: 45000000, created: "2024-01-05T16:45:00Z" },
  { id: "5", firstName: "Hoang", lastName: "Van E", email: "hoangvane@example.com", phone: "0945678901", orderCount: 12, totalSpent: 356000000, created: "2023-06-12T11:30:00Z" },
];

const formatCurrency = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("vi-VN");

const Customers: React.FC = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<any>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setCustomers(MOCK_CUSTOMERS);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const COLUMNS = useMemo(() => [
    { Header: t("customers.name"), accessor: "firstName", Cell: ({ row }: any) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
          <span className="text-primary-500 font-semibold">{row.original.firstName?.charAt(0)}{row.original.lastName?.charAt(0)}</span>
        </div>
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{row.original.firstName} {row.original.lastName}</p>
          <p className="text-xs text-slate-500">{row.original.email}</p>
        </div>
      </div>
    )},
    { Header: t("customers.phone"), accessor: "phone" },
    { Header: t("customers.orders"), accessor: "orderCount", Cell: ({ value }: any) => <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">{value}</span> },
    { Header: t("customers.totalSpent"), accessor: "totalSpent", Cell: ({ value }: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(value)}</span> },
    { Header: t("customers.joined"), accessor: "created", Cell: ({ value }: any) => <span className="text-slate-600 dark:text-slate-300">{formatDate(value)}</span> },
    { Header: t("customers.actions"), accessor: "action", Cell: ({ row }: any) => (
      <div className="flex space-x-3 rtl:space-x-reverse">
        <Tooltip content={t("common.view")}><button className="action-btn" onClick={() => { setViewingCustomer(row.original); setViewModalOpen(true); }}><Icon icon="heroicons:eye" /></button></Tooltip>
        <Tooltip content={t("common.edit")}><button className="action-btn"><Icon icon="heroicons:pencil-square" /></button></Tooltip>
      </div>
    )},
  ], [t]);

  const tableInstance = useTable({ columns: COLUMNS, data: customers }, useGlobalFilter, useSortBy, usePagination, useRowSelect);
  const { getTableProps, getTableBodyProps, headerGroups, page, state, setGlobalFilter, prepareRow } = tableInstance;
  const { globalFilter, pageIndex, pageSize } = state;

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">{t("customers.title")}</h4>
          <div className="md:flex md:space-x-4 md:space-y-0 space-y-2">
            <Textinput value={globalFilter || ""} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={t("customers.search")} />
            <button className="btn btn-outline-dark btn-sm" onClick={fetchCustomers} disabled={loading}><Icon icon="heroicons:arrow-path" className={`ltr:mr-2 ${loading ? "animate-spin" : ""}`} />{loading ? t("common.refreshing") : t("common.refresh")}</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700" {...getTableProps()}>
            <thead className="bg-slate-200 dark:bg-slate-700">
              {headerGroups.map((hg) => <tr {...hg.getHeaderGroupProps()}>{hg.headers.map((col: any) => <th {...col.getHeaderProps(col.getSortByToggleProps())} className="table-th">{col.render("Header")}{col.isSorted ? (col.isSortedDesc ? " 🔽" : " 🔼") : ""}</th>)}</tr>)}
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700" {...getTableBodyProps()}>
              {loading ? <tr><td colSpan={6} className="text-center py-8"><Icon icon="heroicons:arrow-path" className="animate-spin text-2xl" /></td></tr> : page.map((row) => { prepareRow(row); return <tr {...row.getRowProps()}>{row.cells.map((cell) => <td {...cell.getCellProps()} className="table-td">{cell.render("Cell")}</td>)}</tr>; })}
            </tbody>
          </table>
        </div>
        <div className="md:flex justify-between items-center mt-6">
          <select className="form-control py-2 w-max" value={pageSize} onChange={(e: => setPageSize(Number(e.target.value))}>{[10, 25, 50].map((s) => <option key={s} value={s}>{t("common.show")} {s}</option>)}</select>
          <div className="flex space-x-2">
            <button onClick={() => tableInstance.gotoPage(0)} disabled={!tableInstance.canPreviousPage} className="btn btn-sm btn-outline-dark"><Icon icon="heroicons:chevron-double-left" /></button>
            <button onClick={() => tableInstance.previousPage()} disabled={!tableInstance.canPreviousPage} className="btn btn-sm btn-outline-dark">{t("common.previous")}</button>
            {tableInstance.pageOptions.map((p, i) => <button key={i} onClick={() => tableInstance.gotoPage(i)} className={`btn btn-sm ${pageIndex === i ? "btn-dark" : "btn-outline-dark"}`}>{p + 1}</button>)}
            <button onClick={() => tableInstance.nextPage()} disabled={!tableInstance.canNextPage} className="btn btn-sm btn-outline-dark">{t("common.next")}</button>
          </div>
        </div>
      </Card>

      <Modal title={t("customers.viewDetails")} activeModal={viewModalOpen} onClose={() => setViewModalOpen(false)}>
        {viewingCustomer && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                <span className="text-primary-500 text-xl font-bold">{viewingCustomer.firstName?.charAt(0)}{viewingCustomer.lastName?.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">{viewingCustomer.firstName} {viewingCustomer.lastName}</h3>
                <p className="text-slate-500">{viewingCustomer.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div><p className="text-sm text-slate-500">{t("customers.phone")}</p><p className="font-medium">{viewingCustomer.phone}</p></div>
              <div><p className="text-sm text-slate-500">{t("customers.orders")}</p><p className="font-medium">{viewingCustomer.orderCount}</p></div>
              <div><p className="text-sm text-slate-500">{t("customers.totalSpent")}</p><p className="font-medium text-primary-500">{formatCurrency(viewingCustomer.totalSpent)}</p></div>
              <div><p className="text-sm text-slate-500">{t("customers.joined")}</p><p className="font-medium">{formatDate(viewingCustomer.created)}</p></div>
            </div>
            <div className="flex justify-end"><button className="btn btn-dark" onClick={() => setViewModalOpen(false)}>{t("common.close")}</button></div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Customers;
```

## Checklist
- [ ] Customer list với avatar initials
- [ ] Order count và total spent
- [ ] View customer details

## Liên kết
- [Day 16: SignalR + Notifications](./day-16.md) - Tiếp theo
