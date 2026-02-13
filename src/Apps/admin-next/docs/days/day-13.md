# Day 13: Coupons Module

## Mục tiêu
Xây dựng Coupons Module quản lý mã giảm giá với approve/reject workflow.

## Coupons Component - `src/components/partials/coupon/index.tsx`

```typescript
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import Textinput from "@/components/ui/Textinput";
import Modal from "@/components/ui/Modal";
import Flatpickr from "react-flatpickr";
import { formatCurrency } from "@/utils/format";
import { useTable, useRowSelect, useSortBy, useGlobalFilter, usePagination } from "react-table";

const MOCK_COUPONS = [
  { id: "1", code: "SAVE20", name: "Summer Sale 2025", discount: 20, type: "percent", displayType: "Percentage", minOrder: 100000, maxDiscount: 500000, usageLimit: 100, usedCount: 45, startDate: "2025-01-01T00:00:00Z", expiryDate: "2025-06-30T23:59:59Z", status: "active", displayStatus: "Approved", isValid: true, isExpired: false, isOutOfUses: false },
  { id: "2", code: "WELCOME50K", name: "New Customer", discount: 50000, type: "fixed", displayType: "Fixed", minOrder: 200000, maxDiscount: null, usageLimit: 500, usedCount: 123, startDate: "2025-01-15T00:00:00Z", expiryDate: "2025-12-31T23:59:59Z", status: "active", displayStatus: "Approved", isValid: true, isExpired: false, isOutOfUses: false },
  { id: "3", code: "FLASH30", name: "Flash Sale", discount: 30, type: "percent", displayType: "Percentage", minOrder: 300000, maxDiscount: 300000, usageLimit: 50, usedCount: 50, startDate: "2025-01-10T00:00:00Z", expiryDate: "2025-02-01T23:59:59Z", status: "expired", displayStatus: "Approved", isValid: false, isExpired: true, isOutOfUses: true },
  { id: "4", code: "VIP2025", name: "VIP Exclusive", discount: 15, type: "percent", displayType: "Percentage", minOrder: 500000, maxDiscount: 1000000, usageLimit: null, usedCount: 8, startDate: "2025-02-01T00:00:00Z", expiryDate: "2025-08-31T23:59:59Z", status: "inactive", displayStatus: "Pending", isValid: true, isExpired: false, isOutOfUses: false },
];

const CouponPage: React.FC = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingCoupon, setViewingCoupon] = useState<any>(null);
  const [validityModalOpen, setValidityModalOpen] = useState(false);
  const [validityDates, setValidityDates] = useState({ start: new Date(), end: new Date() });
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setCoupons(MOCK_COUPONS);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleApprove = async () => {
    if (!viewingCoupon) return;
    setApproving(true);
    await new Promise((r) => setTimeout(r, 500));
    setCoupons((prev) => prev.map((c) => c.id === viewingCoupon.id ? { ...c, displayStatus: "Approved", status: "active" } : c));
    toast.success(t("coupon.approveSuccess"));
    setViewingCoupon((prev: any) => ({ ...prev, displayStatus: "Approved", status: "active" }));
    setApproving(false);
  };

  const handleReject = async () => {
    if (!viewingCoupon) return;
    setRejecting(true);
    await new Promise((r) => setTimeout(r, 500));
    setCoupons((prev) => prev.map((c) => c.id === viewingCoupon.id ? { ...c, displayStatus: "Rejected", status: "inactive" } : c));
    toast.success(t("coupon.rejectSuccess"));
    setViewingCoupon((prev: any) => ({ ...prev, displayStatus: "Rejected", status: "inactive" }));
    setRejecting(false);
  };

  const COLUMNS = useMemo(() => [
    { Header: t("coupon.code"), accessor: "code", Cell: ({ value }: any) => <span className="font-mono font-bold text-primary-500 bg-primary-500/10 px-2 py-1 rounded">{value}</span> },
    { Header: t("coupon.discount"), accessor: "discount", Cell: ({ row }: any) => <span className="font-semibold">{row.original.type === "percent" ? `${row.original.discount}%` : formatCurrency(row.original.discount)}</span> },
    { Header: t("coupon.type"), accessor: "displayType", Cell: ({ row }: any) => <span className={`inline-block px-2 py-1 rounded text-sm ${row.original.type === "percent" ? "bg-blue-500/20 text-blue-500" : "bg-green-500/20 text-green-500"}`}>{row.original.type === "percent" ? t("coupon.percent") : t("coupon.fixed")}</span> },
    { Header: t("coupon.minOrder"), accessor: "minOrder", Cell: ({ value }: any) => <span className="text-slate-600 dark:text-slate-300">{formatCurrency(value)}</span> },
    { Header: t("coupon.usedCount"), accessor: "usedCount", Cell: ({ row }: any) => <span>{row.original.usedCount}{row.original.usageLimit && ` / ${row.original.usageLimit}`}</span> },
    { Header: t("coupon.expiryDate"), accessor: "expiryDate", Cell: ({ value }: any) => <span className={new Date(value) < new Date() ? "text-danger-500" : ""}>{new Date(value).toLocaleDateString("vi-VN")}</span> },
    { Header: t("coupon.status"), accessor: "displayStatus", Cell: ({ row }: any) => {
      const status = row.original.displayStatus || row.original.status;
      return <span className={`inline-block px-3 min-w-[90px] text-center py-1 rounded-full ${status === "Approved" || row.original.status === "active" ? "text-success-500 bg-success-500/30" : status === "Pending" || row.original.status === "inactive" ? "text-warning-500 bg-warning-500/30" : "text-danger-500 bg-danger-500/30"}`}>{status === "Approved" ? t("coupon.approved") : status === "Pending" ? t("coupon.pending") : status === "Rejected" ? t("coupon.rejected") : t("coupon.active")}</span>;
    }},
    { Header: t("coupon.actions"), accessor: "action", Cell: ({ row }: any) => (
      <div className="flex space-x-3 rtl:space-x-reverse">
        <Tooltip content={t("common.view")}><button className="action-btn" onClick={() => { setViewingCoupon(row.original); setViewModalOpen(true); }}><Icon icon="heroicons:eye" /></button></Tooltip>
        <Tooltip content={t("common.edit")}><Link href={`/edit-coupon/${row.original.id}`} className="action-btn"><Icon icon="heroicons:pencil-square" /></Link></Tooltip>
      </div>
    )},
  ], [t]);

  const tableInstance = useTable({ columns: COLUMNS, data: coupons }, useGlobalFilter, useSortBy, usePagination, useRowSelect);
  const { getTableProps, getTableBodyProps, headerGroups, page, state, setGlobalFilter, prepareRow } = tableInstance;
  const { globalFilter, pageIndex, pageSize } = state;

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">{t("coupon.title")}</h4>
          <div className="md:flex md:space-x-4 md:space-y-0 space-y-2">
            <Textinput value={globalFilter || ""} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={t("coupon.search")} />
            <button className="btn btn-outline-dark btn-sm" onClick={fetchCoupons} disabled={loading}><Icon icon="heroicons:arrow-path" className={`ltr:mr-2 ${loading ? "animate-spin" : ""}`} />{loading ? t("common.refreshing") : t("common.refresh")}</button>
            <Link href="/create-coupon" className="btn btn-dark btn-sm"><Icon icon="heroicons:plus" className="ltr:mr-2" />{t("coupon.createNew")}</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700" {...getTableProps()}>
            <thead className="bg-slate-200 dark:bg-slate-700">
              {headerGroups.map((hg) => <tr {...hg.getHeaderGroupProps()}>{hg.headers.map((col: any) => <th {...col.getHeaderProps(col.getSortByToggleProps())} className="table-th">{col.render("Header")}</th>)}</tr>)}
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700" {...getTableBodyProps()}>
              {page.map((row) => { prepareRow(row); return <tr {...row.getRowProps()}>{row.cells.map((cell) => <td {...cell.getCellProps()} className="table-td">{cell.render("Cell")}</td>)}</tr>; })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal title={t("coupon.viewDetail")} activeModal={viewModalOpen} onClose={() => setViewModalOpen(false)}>
        {viewingCoupon && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-mono text-2xl font-bold text-primary-500 bg-primary-500/10 px-4 py-2 rounded-lg">{viewingCoupon.code}</span>
              <div className="flex space-x-2">
                {viewingCoupon.displayStatus !== "Approved" && <button className="btn btn-success btn-sm" onClick={handleApprove} disabled={approving}>{approving ? <Icon icon="heroicons:arrow-path" className="animate-spin mr-2" /> : <Icon icon="heroicons:check-circle" className="mr-2" />}{t("coupon.approve")}</button>}
                {viewingCoupon.displayStatus !== "Rejected" && <button className="btn btn-danger btn-sm" onClick={handleReject} disabled={rejecting}>{rejecting ? <Icon icon="heroicons:arrow-path" className="animate-spin mr-2" /> : <Icon icon="heroicons:x-circle" className="mr-2" />}{t("coupon.reject")}</button>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-slate-500">{t("coupon.programName")}</p><p className="font-medium">{viewingCoupon.name}</p></div>
              <div><p className="text-sm text-slate-500">{t("coupon.status")}</p><span className={`inline-block px-3 py-1 rounded-full text-sm ${viewingCoupon.displayStatus === "Approved" ? "bg-success-500/30 text-success-500" : viewingCoupon.displayStatus === "Pending" ? "bg-warning-500/30 text-warning-500" : "bg-danger-500/30 text-danger-500"}`}>{viewingCoupon.displayStatus}</span></div>
            </div>
            <div className="border-t pt-4">
              <h6 className="font-semibold mb-3">{t("coupon.discountInfo")}</h6>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-slate-500">{t("coupon.type")}</p><p>{viewingCoupon.type === "percent" ? t("coupon.percent") : t("coupon.fixed")}</p></div>
                <div><p className="text-sm text-slate-500">{t("coupon.discount")}</p><p className="font-semibold text-lg text-primary-500">{viewingCoupon.type === "percent" ? `${viewingCoupon.discount}%` : formatCurrency(viewingCoupon.discount)}</p></div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CouponPage;
```

## Checklist
- [ ] Coupon list với discount type (percent/fixed)
- [ ] Approve/Reject workflow
- [ ] Validity period management
- [ ] Usage count tracking

## Liên kết
- [Day 14: Inventory Module](./day-14.md) - Tiếp theo
