# Day 14: Inventory Module

## Mục tiêu
Xây dựng Inventory Module quản lý kho hàng với stock operations.

## Inventory Component - `src/components/partials/inventory/index.tsx`

```typescript
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import Textinput from "@/components/ui/Textinput";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { useTable, useRowSelect, useSortBy, useGlobalFilter, usePagination } from "react-table";

const MOCK_INVENTORY = [
  { id: "inv-1", productId: "prod-1", productName: "Wireless Mouse", sku: "WM-001", locationId: "loc-1", location: "Main Warehouse - A", quantity: 150, available: 140, reserved: 10, status: "in_stock", lastUpdated: "2026-02-01T10:30:00Z" },
  { id: "inv-2", productId: "prod-2", productName: "Mechanical Keyboard", sku: "KB-002", locationId: "loc-1", location: "Main Warehouse - A", quantity: 85, available: 75, reserved: 10, status: "in_stock", lastUpdated: "2026-02-01T09:15:00Z" },
  { id: "inv-3", productId: "prod-4", productName: "Laptop Stand", sku: "LS-004", locationId: "loc-3", location: "Retail Store - Downtown", quantity: 8, available: 5, reserved: 3, status: "low_stock", lastUpdated: "2026-01-30T14:20:00Z" },
  { id: "inv-4", productId: "prod-5", productName: "Webcam HD", sku: "CAM-005", locationId: "loc-1", location: "Main Warehouse - A", quantity: 0, available: 0, reserved: 0, status: "out_of_stock", lastUpdated: "2026-01-28T11:00:00Z" },
];

const getStatusFromQuantity = (quantity: number, available: number) => {
  if (quantity === 0 || available === 0) return "out_of_stock";
  if (available < 10) return "low_stock";
  return "in_stock";
};

const InventoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockModal, setStockModal] = useState<{ open: boolean; type: "increase" | "decrease"; item: any }>({ open: false, type: "increase", item: null });
  const [stockQuantity, setStockQuantity] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setInventory(MOCK_INVENTORY);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleStockUpdate = async () => {
    if (!stockModal.item || !stockQuantity || parseInt(stockQuantity) <= 0) {
      toast.error(t("inventory.invalidQuantity")); return;
    }
    if (stockModal.type === "decrease" && parseInt(stockQuantity) > stockModal.item.available) {
      toast.error(t("inventory.insufficientStock")); return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const amount = parseInt(stockQuantity);
    setInventory((prev) => prev.map((item) => {
      if (item.id === stockModal.item.id) {
        const newQuantity = stockModal.type === "increase" ? item.quantity + amount : item.quantity - amount;
        const newAvailable = stockModal.type === "increase" ? item.available + amount : item.available - amount;
        return { ...item, quantity: newQuantity, available: newAvailable, status: getStatusFromQuantity(newQuantity, newAvailable), lastUpdated: new Date().toISOString() };
      }
      return item;
    }));
    toast.success(stockModal.type === "increase" ? t("inventory.stockIncreased") : t("inventory.stockDecreased"));
    setSaving(false);
    setStockModal({ open: false, type: "increase", item: null });
    setStockQuantity("");
  };

  const COLUMNS = useMemo(() => [
    { Header: t("inventory.product"), accessor: "productName", Cell: ({ value }: any) => <span className="text-slate-800 dark:text-slate-200 font-medium">{value}</span> },
    { Header: t("inventory.sku"), accessor: "sku", Cell: ({ value }: any) => <span className="font-mono text-sm text-slate-500">{value}</span> },
    { Header: t("inventory.quantity"), accessor: "quantity", Cell: ({ row }: any) => <span className="font-semibold">{row.original.quantity}</span> },
    { Header: t("inventory.available"), accessor: "available", Cell: ({ value }: any) => <span>{value}</span> },
    { Header: t("inventory.reserved"), accessor: "reserved", Cell: ({ value }: any) => <span className="text-slate-600">{value || 0}</span> },
    { Header: t("inventory.location"), accessor: "location" },
    { Header: t("inventory.status"), accessor: "status", Cell: ({ row }: any) => {
      const status = row.original.quantity === 0 ? "out_of_stock" : row.original.quantity < 10 ? "low_stock" : "in_stock";
      const statusText = status === "out_of_stock" ? t("inventory.outOfStock") : status === "low_stock" ? t("inventory.lowStock") : t("inventory.inStock");
      return <span className={`inline-block px-3 min-w-[90px] text-center py-1 rounded-full ${status === "in_stock" ? "text-success-500 bg-success-500/30" : status === "low_stock" ? "text-warning-500 bg-warning-500/30" : "text-danger-500 bg-danger-500/30"}`}>{statusText}</span>;
    }},
    { Header: t("inventory.actions"), accessor: "action", Cell: ({ row }: any) => (
      <div className="flex space-x-3 rtl:space-x-reverse">
        <Tooltip content={t("inventory.increaseStock")}><button className="action-btn" onClick={() => { setStockModal({ open: true, type: "increase", item: row.original }); setStockQuantity(""); }}><Icon icon="heroicons:arrow-up" /></button></Tooltip>
        <Tooltip content={t("inventory.decreaseStock")}><button className="action-btn" onClick={() => { setStockModal({ open: true, type: "decrease", item: row.original }); setStockQuantity(""); }}><Icon icon="heroicons:arrow-down" /></button></Tooltip>
      </div>
    )},
  ], [t]);

  const tableInstance = useTable({ columns: COLUMNS, data: inventory }, useGlobalFilter, useSortBy, usePagination, useRowSelect);
  const { getTableProps, getTableBodyProps, headerGroups, page, state, setGlobalFilter, prepareRow } = tableInstance;

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">{t("inventory.title")}</h4>
          <div className="md:flex md:space-x-4 md:space-y-0 space-y-2">
            <Textinput value={state.globalFilter || ""} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={t("inventory.search")} />
            <button className="btn btn-outline-dark btn-sm" onClick={fetchInventory} disabled={loading}><Icon icon="heroicons:arrow-path" className={`ltr:mr-2 ${loading ? "animate-spin" : ""}`} />{loading ? t("common.refreshing") : t("common.refresh")}</button>
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

      <Modal title={stockModal.type === "increase" ? t("inventory.increaseStock") : t("inventory.decreaseStock")} activeModal={stockModal.open} onClose={() => setStockModal({ open: false, type: "increase", item: null })}>
        <div className="space-y-4">
          {stockModal.item && <p className="text-sm">{t("inventory.product")}: <span className="font-semibold">{stockModal.item.productName}</span></p>}
          <div><label className="block text-sm font-medium mb-2">{t("inventory.quantity")}</label><Textinput type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} placeholder="Enter quantity" /></div>
          <div className="flex justify-end space-x-3">
            <button className="btn btn-outline-dark" onClick={() => setStockModal({ open: false, type: "increase", item: null })}>{t("common.cancel")}</button>
            <button className="btn btn-dark" onClick={handleStockUpdate} disabled={saving}>{saving ? <Icon icon="heroicons:arrow-path" className="animate-spin mr-2" /> : <Icon icon="heroicons:check" className="mr-2" />}{t("common.save")}</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default InventoryPage;
```

## Checklist
- [ ] Inventory list với quantity/available/reserved
- [ ] Stock status (in_stock/low_stock/out_of_stock)
- [ ] Increase/Decrease stock operations
- [ ] Location management

## Liên kết
- [Day 15: Customers Module](./day-15.md) - Tiếp theo
