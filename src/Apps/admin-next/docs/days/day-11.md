# Day 11: Brands Module

## Mục tiêu
Xây dựng Brands Module quản lý thương hiệu sản phẩm.

## Brand Component - `src/components/partials/brand/index.tsx`

```typescript
"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Tooltip from "@/components/ui/Tooltip";
import Textinput from "@/components/ui/Textinput";
import Modal from "@/components/ui/Modal";
import { useTable, useRowSelect, useSortBy, useGlobalFilter, usePagination } from "react-table";

interface Brand { id: string; name: string; slug: string; }

const MOCK_BRANDS: Brand[] = [
  { id: "1", name: "Nike", slug: "nike" },
  { id: "2", name: "Adidas", slug: "adidas" },
  { id: "3", name: "Apple", slug: "apple" },
  { id: "4", name: "Samsung", slug: "samsung" },
  { id: "5", name: "Sony", slug: "sony" },
];

const generateSlug = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const BrandPage: React.FC = () => {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Brand | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBrands([...MOCK_BRANDS]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const handleSave = async () => {
    if (!formData.name) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (editingBrand) {
      setBrands((prev) => prev.map((b) => (b.id === editingBrand.id ? { ...b, name: formData.name, slug: generateSlug(formData.name) } : b)));
      toast.success(t("brand.updateSuccess"));
    } else {
      setBrands((prev) => [...prev, { id: Date.now().toString(), name: formData.name, slug: generateSlug(formData.name) }]);
      toast.success(t("brand.createSuccess"));
    }
    setSaving(false);
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingBrand(null);
    setFormData({ name: "" });
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBrands((prev) => prev.filter((b) => b.id !== itemToDelete.id));
    toast.success(t("brand.deleteSuccess"));
    setDeleting(false);
    setDeleteModalOpen(false);
  };

  const COLUMNS = useMemo(() => [
    { Header: t("brand.name"), accessor: "name", Cell: ({ value }: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span> },
    { Header: t("brand.slug"), accessor: "slug", Cell: ({ value }: any) => <span className="font-mono text-sm text-slate-500">{value}</span> },
    { Header: t("brand.actions"), accessor: "action", Cell: ({ row }: any) => {
      const brand = row.original;
      return (
        <div className="flex space-x-3 rtl:space-x-reverse">
          <Tooltip content={t("common.view")}><button className="action-btn" onClick={() => { setViewingBrand(brand); setShowViewModal(true); }}><Icon icon="heroicons:eye" /></button></Tooltip>
          <Tooltip content={t("common.edit")}><button className="action-btn" onClick={() => { setEditingBrand(brand); setFormData({ name: brand.name }); setShowEditModal(true); }}><Icon icon="heroicons:pencil-square" /></button></Tooltip>
          <Tooltip content={t("common.delete")} theme="danger"><button className="action-btn" onClick={() => { setItemToDelete(brand); setDeleteModalOpen(true); }}><Icon icon="heroicons:trash" /></button></Tooltip>
        </div>
      );
    }},
  ], [t]);

  const tableInstance = useTable({ columns: COLUMNS, data: brands }, useGlobalFilter, useSortBy, usePagination, useRowSelect);
  const { getTableProps, getTableBodyProps, headerGroups, page, nextPage, previousPage, canNextPage, canPreviousPage, pageOptions, state, gotoPage, pageCount, setPageSize, setGlobalFilter, prepareRow } = tableInstance;
  const { globalFilter, pageIndex, pageSize } = state;

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">{t("brand.title")}</h4>
          <div className="md:flex md:space-x-4 md:space-y-0 space-y-2">
            <Textinput value={globalFilter || ""} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={t("brand.search")} />
            <button className="btn btn-outline-dark btn-sm" onClick={fetchBrands} disabled={loading}><Icon icon="heroicons:arrow-path" className={`ltr:mr-2 ${loading ? "animate-spin" : ""}`} />{loading ? t("common.refreshing") : t("common.refresh")}</button>
            <button className="btn btn-dark btn-sm" onClick={() => { setEditingBrand(null); setFormData({ name: "" }); setShowAddModal(true); }}><Icon icon="heroicons:plus" className="ltr:mr-2" />{t("brand.add")}</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700" {...getTableProps()}>
            <thead className="bg-slate-200 dark:bg-slate-700">
              {headerGroups.map((hg) => <tr {...hg.getHeaderGroupProps()}>{hg.headers.map((col: any) => <th {...col.getHeaderProps(col.getSortByToggleProps())} className="table-th">{col.render("Header")}{col.isSorted ? (col.isSortedDesc ? " 🔽" : " 🔼") : ""}</th>)}</tr>)}
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700" {...getTableBodyProps()}>
              {page.map((row) => { prepareRow(row); return <tr {...row.getRowProps()}>{row.cells.map((cell) => <td {...cell.getCellProps()} className="table-td">{cell.render("Cell")}</td>)}</tr>; })}
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

      <Modal title={editingBrand ? t("brand.edit") : t("brand.add")} activeModal={showAddModal || showEditModal} onClose={() => { setShowAddModal(false); setShowEditModal(false); }}>
        <div className="space-y-4">
          <Textinput label={t("brand.name")} value={formData.name} onChange={(e) => setFormData({ name: e.target.value })} placeholder={t("brand.namePlaceholder")} />
          <div className="flex justify-end space-x-3">
            <button className="btn btn-outline-dark" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>{t("common.cancel")}</button>
            <button className="btn btn-dark" onClick={handleSave} disabled={saving}>{saving ? <Icon icon="heroicons:arrow-path" className="animate-spin mr-2" /> : <Icon icon="heroicons:check" className="mr-2" />}{t("common.save")}</button>
          </div>
        </div>
      </Modal>

      <Modal title={t("brand.viewDetails")} activeModal={showViewModal} onClose={() => setShowViewModal(false)}>
        {viewingBrand && (
          <div className="space-y-4">
            <div><label className="text-sm text-slate-500">{t("brand.name")}</label><p className="font-semibold">{viewingBrand.name}</p></div>
            <div><label className="text-sm text-slate-500">{t("brand.slug")}</label><p className="font-mono text-sm">{viewingBrand.slug}</p></div>
            <div className="flex justify-end"><button className="btn btn-dark" onClick={() => setShowViewModal(false)}>{t("common.close")}</button></div>
          </div>
        )}
      </Modal>

      <Modal title={t("common.deleteConfirmTitle")} activeModal={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center"><Icon icon="heroicons:exclamation-triangle" className="text-danger-500 text-3xl" /></div>
          <p className="text-slate-600 dark:text-slate-300 mb-2">{t("common.deleteBrandMessage")}</p>
          {itemToDelete && <p className="font-semibold mb-6">"{itemToDelete.name}"</p>}
          <div className="flex justify-center space-x-3">
            <button className="btn btn-outline-dark" onClick={() => setDeleteModalOpen(false)}>{t("common.cancel")}</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>{deleting ? <Icon icon="heroicons:arrow-path" className="animate-spin mr-2" /> : <Icon icon="heroicons:trash" className="mr-2" />}{t("common.delete")}</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BrandPage;
```

## Checklist
- [ ] Brand list với slug auto-generate
- [ ] CRUD operations đầy đủ
- [ ] View modal hiển thị chi tiết

## Liên kết
- [Day 12: Orders Module](./day-12.md) - Tiếp theo
