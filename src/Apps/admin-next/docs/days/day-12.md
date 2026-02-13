# Day 12: Orders Module

## Mục tiêu
Xây dựng Orders Module quản lý đơn hàng với status workflow.

## Order Status Workflow
```
Pending → Confirmed → Processing → Shipped → Delivered
   ↓          ↓           ↓           ↓
Canceled (có thể cancel từ các state trước delivered)
Delivered → Refunded (nếu cần hoàn tiền)
```

## Orders Component - `src/components/partials/orders/index.tsx`

```typescript
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import Textinput from "@/components/ui/Textinput";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { formatCurrency } from "@/utils/format";
import { useTable, useRowSelect, useSortBy, useGlobalFilter, usePagination } from "react-table";

const ORDER_STATUS_MAP: Record<number, string> = {
  0: "pending", 1: "confirmed", 2: "processing", 3: "shipped", 4: "delivered", 5: "canceled", 6: "refunded"
};

const getAvailableStatuses = (currentStatus: number, t: any) => {
  const allStatuses = [
    { value: 0, label: t("orders.pending") }, { value: 1, label: t("orders.confirmed") },
    { value: 2, label: t("orders.processing") }, { value: 3, label: t("orders.shipped") },
    { value: 4, label: t("orders.delivered") }, { value: 5, label: t("orders.cancelled") },
    { value: 6, label: t("orders.refunded") },
  ];
  const transitionMap: Record<number, number[]> = {
    0: [1, 2, 5], 1: [2, 5], 2: [3, 5], 3: [4, 5], 4: [6], 5: [], 6: []
  };
  return allStatuses.filter((s) => transitionMap[currentStatus]?.includes(s.value));
};

const MOCK_ORDERS = [
  { id: "1", orderNo: "ORD-2024-001", customer: { name: "Nguyen Van A", email: "a@example.com" }, createdOnUtc: "2024-01-15T08:30:00Z", orderItems: [{ id: "1", productName: "iPhone 15", quantity: 1, price: 34990000 }], finalPrice: 34990000, status: 4, cancelReason: null, refundReason: null },
  { id: "2", orderNo: "ORD-2024-002", customer: { name: "Tran Thi B", email: "b@example.com" }, createdOnUtc: "2024-01-14T14:20:00Z", orderItems: [{ id: "2", productName: "MacBook Pro", quantity: 1, price: 52990000 }, { id: "3", productName: "AirPods", quantity: 1, price: 5990000 }], finalPrice: 58980000, status: 2, cancelReason: null, refundReason: null },
  { id: "3", orderNo: "ORD-2024-003", customer: { name: "Le Van C", email: "c@example.com" }, createdOnUtc: "2024-01-13T09:15:00Z", orderItems: [{ id: "4", productName: "Samsung S24", quantity: 2, price: 31990000 }], finalPrice: 63980000, status: 1, cancelReason: null, refundReason: null },
  { id: "4", orderNo: "ORD-2024-004", customer: { name: "Pham Thi D", email: "d@example.com" }, createdOnUtc: "2024-01-12T16:45:00Z", orderItems: [{ id: "5", productName: "Sony Headphones", quantity: 1, price: 7990000 }], finalPrice: 7990000, status: 0, cancelReason: null, refundReason: null },
  { id: "5", orderNo: "ORD-2024-005", customer: { name: "Hoang Van E", email: "e@example.com" }, createdOnUtc: "2024-01-11T11:30:00Z", orderItems: [{ id: "6", productName: "iPad Pro", quantity: 1, price: 29990000 }], finalPrice: 29990000, status: 5, cancelReason: "Customer requested cancellation", refundReason: null },
];

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const Orders: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateReason, setUpdateReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setOrders(MOCK_ORDES);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    const statusValue = parseInt(updateStatus);
    const requiresReason = statusValue === 5 || statusValue === 6;
    if (requiresReason && !updateReason.trim()) { setReasonError(true); return; }
    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, status: statusValue, cancelReason: statusValue === 5 ? updateReason : o.cancelReason, refundReason: statusValue === 6 ? updateReason : o.refundReason } : o));
    toast.success(t("orders.statusUpdated"));
    setIsUpdating(false);
    setStatusModalOpen(false);
  };

  const COLUMNS = useMemo(() => [
    { Header: t("orders.orderNumber"), accessor: "orderNo", Cell: ({ row }: any) => <Link href={`/orders/${row.original.id}`} className="font-medium text-primary-500 hover:text-primary-600">{row.original.orderNo}</Link> },
    { Header: t("orders.customer"), accessor: "customer", Cell: ({ value }: any) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center"><span className="text-sm font-medium">{value?.name?.charAt(0) || "?"}</span></div>
        <div><p className="font-medium text-slate-800 dark:text-slate-200">{value?.name}</p><p className="text-xs text-slate-500">{value?.email}</p></div>
      </div>
    )},
    { Header: t("orders.orderDate"), accessor: "createdOnUtc", Cell: ({ value }: any) => <span className="text-slate-600 dark:text-slate-300">{formatDate(value)}</span> },
    { Header: t("orders.items"), accessor: "orderItems", Cell: ({ value }: any) => <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{value?.length || 0}</span> },
    { Header: t("orders.total"), accessor: "finalPrice", Cell: ({ value }: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(value || 0)}</span> },
    { Header: t("orders.status"), accessor: "status", Cell: ({ row }: any) => {
      const order = row.original;
      const status = ORDER_STATUS_MAP[order.status];
      const statusConfig: Record<string, { label: string; class: string }> = {
        pending: { label: t("orders.pending"), class: "text-warning-500 bg-warning-500/30" },
        confirmed: { label: t("orders.confirmed"), class: "text-info-500 bg-info-500/30" },
        processing: { label: t("orders.processing"), class: "text-info-500 bg-info-500/30" },
        shipped: { label: t("orders.shipped"), class: "text-primary-500 bg-primary-500/30" },
        delivered: { label: t("orders.delivered"), class: "text-success-500 bg-success-500/30" },
        canceled: { label: t("orders.cancelled"), class: "text-danger-500 bg-danger-500/30" },
        refunded: { label: t("orders.refunded"), class: "text-slate-500 bg-slate-500/30" },
      };
      const config = statusConfig[status];
      return <span className={`inline-block px-3 min-w-[90px] text-center py-1 rounded-full ${config.class}`}>{config.label}</span>;
    }},
    { Header: t("orders.actions"), accessor: "action", Cell: ({ row }: any) => {
      const order = row.original;
      const availableStatuses = getAvailableStatuses(order.status, t);
      return (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tooltip content={t("common.view")}><Link href={`/orders/${order.id}`} className="action-btn"><Icon icon="heroicons:eye" /></Link></Tooltip>
          {availableStatuses.length > 0 && <Tooltip content={t("orders.updateStatus")}><button className="action-btn" onClick={() => { setSelectedOrder(order); setUpdateStatus(availableStatuses[0]?.value.toString() || ""); setUpdateReason(""); setReasonError(false); setStatusModalOpen(true); }}><Icon icon="heroicons:pencil-square" /></button></Tooltip>}
        </div>
      );
    }},
  ], [t]);

  const filteredData = useMemo(() => statusFilter === "all" ? orders : orders.filter((o) => ORDER_STATUS_MAP[o.status] === statusFilter), [orders, statusFilter]);
  const tableInstance = useTable({ columns: COLUMNS, data: filteredData }, useGlobalFilter, useSortBy, usePagination, useRowSelect);
  const { getTableProps, getTableBodyProps, headerGroups, page, nextPage, previousPage, canNextPage, canPreviousPage, pageOptions, state, gotoPage, pageCount, setPageSize, setGlobalFilter, prepareRow } = tableInstance;
  const { globalFilter, pageIndex, pageSize } = state;

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, refunded: 0 };
    orders.forEach((o) => { const key = ORDER_STATUS_MAP[o.status]; if (counts.hasOwnProperty(key)) (counts as any)[key]++; });
    return counts;
  }, [orders]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { key: "all", label: t("orders.all"), icon: "heroicons:inbox", color: "bg-slate-500" },
          { key: "pending", label: t("orders.pending"), icon: "heroicons:clock", color: "bg-warning-500" },
          { key: "processing", label: t("orders.processing"), icon: "heroicons:cog-6-tooth", color: "bg-info-500" },
          { key: "shipped", label: t("orders.shipped"), icon: "heroicons:truck", color: "bg-primary-500" },
          { key: "delivered", label: t("orders.delivered"), icon: "heroicons:check-circle", color: "bg-success-500" },
          { key: "cancelled", label: t("orders.cancelled"), icon: "heroicons:x-circle", color: "bg-danger-500" },
        ].map((item) => (
          <button key={item.key} onClick={() => setStatusFilter(item.key)} className={`p-4 rounded-lg border-2 transition-all ${statusFilter === item.key ? "border-primary-500 bg-primary-500/10" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"}`}>
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}><Icon icon={item.icon} className="text-white text-xl" /></div>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{(statusCounts as any)[item.key]}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-left">{item.label}</p>
          </button>
        ))}
      </div>

      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">{t("orders.title")}</h4>
          <div className="md:flex md:space-x-4 md:space-y-0 space-y-2 mt-4 md:mt-0">
            <Textinput value={globalFilter || ""} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={t("orders.search")} />
            <button className="btn btn-outline-dark btn-sm" onClick={fetchOrders} disabled={loading}><Icon icon="heroicons:arrow-path" className={`ltr:mr-2 ${loading ? "animate-spin" : ""}`} />{loading ? t("common.refreshing") : t("common.refresh")}</button>
            <button className="btn btn-primary btn-sm" onClick={() => router.push("/orders/create")}><Icon icon="heroicons:plus" className="ltr:mr-2" />{t("orders.createNew")}</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700" {...getTableProps()}>
            <thead className="bg-slate-200 dark:bg-slate-700">
              {headerGroups.map((hg) => <tr {...hg.getHeaderGroupProps()}>{hg.headers.map((col: any) => <th {...col.getHeaderProps(col.getSortByToggleProps())} className="table-th">{col.render("Header")}{col.isSorted ? (col.isSortedDesc ? " 🔽" : " 🔼") : ""}</th>)}</tr>)}
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700" {...getTableBodyProps()}>
              {loading ? <tr><td colSpan={7} className="text-center py-8"><Icon icon="heroicons:arrow-path" className="animate-spin text-2xl" /></td></tr> : page.length === 0 ? <tr><td colSpan={7} className="text-center py-8">{t("orders.noOrders")}</td></tr> : page.map((row) => { prepareRow(row); return <tr {...row.getRowProps()}>{row.cells.map((cell) => <td {...cell.getCellProps()} className="table-td">{cell.render("Cell")}</td>)}</tr>; })}
            </tbody>
          </table>
        </div>
        <div className="md:flex justify-between items-center mt-6">
          <select className="form-control py-2 w-max" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>{[10, 25, 50].map((s) => <option key={s} value={s}>{t("common.show")} {s}</option>)}</select>
          <div className="flex space-x-2">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="btn btn-sm btn-outline-dark"><Icon icon="heroicons:chevron-double-left" /></button>
            <button onClick={() => previousPage()} disabled={!canPreviousPage} className="btn btn-sm btn-outline-dark">{t("common.previous")}</button>
            {pageOptions.map((p, i) => <button key={i} onClick={() => gotoPage(i)} className={`btn btn-sm ${pageIndex === i ? "btn-dark" : "btn-outline-dark"}`}>{p + 1}</button>)}
            <button onClick={() => nextPage()} disabled={!canNextPage} className="btn btn-sm btn-outline-dark">{t("common.next")}</button>
          </div>
        </div>
      </Card>

      <Modal title={t("orders.updateStatus")} activeModal={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
        <div className="space-y-4">
          {selectedOrder && <p className="text-sm text-slate-600 dark:text-slate-300">{t("orders.orderNumber")}: <span className="font-semibold">{selectedOrder.orderNo}</span></p>}
          <div>
            <label className="block text-sm font-medium mb-2">{t("orders.status")} <span className="text-danger-500">*</span></label>
            <Select value={updateStatus} onChange={(e) => { setUpdateStatus(e.target.value); if (e.target.value !== "5" && e.target.value !== "6") { setUpdateReason(""); setReasonError(false); } }} options={selectedOrder ? getAvailableStatuses(selectedOrder.status, t).map((s) => ({ value: s.value.toString(), label: s.label })) : []} />
          </div>
          {(updateStatus === "5" || updateStatus === "6") && (
            <div>
              <label className="block text-sm font-medium mb-2">{t("orders.reason")} <span className="text-danger-500">*</span></label>
              <Textarea className={reasonError ? "border-danger-500" : ""} rows={4} placeholder={t("orders.reasonPlaceholder")} value={updateReason} onChange={(e) => { setUpdateReason(e.target.value); if (e.target.value.trim()) setReasonError(false); }} />
              {reasonError && <p className="text-danger-500 text-sm mt-1">{t("orders.reasonRequired")}</p>}
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button className="btn btn-outline-dark" onClick={() => setStatusModalOpen(false)}>{t("common.cancel")}</button>
            <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={isUpdating}>{isUpdating ? <Icon icon="heroicons:arrow-path" className="animate-spin mr-2" /> : null}{t("orders.updateStatus")}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
```

## Checklist
- [ ] Order status workflow đúng
- [ ] Status filter cards hiển thị counts
- [ ] Update status với reason cho cancel/refund
- [ ] Status transition validation

## Liên kết
- [Day 13: Coupons Module](./day-13.md) - Tiếp theo
