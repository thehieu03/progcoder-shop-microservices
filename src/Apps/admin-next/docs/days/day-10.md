# Day 10: Categories Module

## Mục tiêu

Xây dựng Categories Module:
- Category List với tree structure
- CRUD operations
- Parent-child relationship

## Category Component - `src/components/partials/category/index.tsx`

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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  parentName: string | null;
}

const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets", parentId: null, parentName: null },
  { id: "2", name: "Smartphones", slug: "smartphones", description: "Mobile phones and accessories", parentId: "1", parentName: "Electronics" },
  { id: "3", name: "Laptops", slug: "laptops", description: "Notebook computers", parentId: "1", parentName: "Electronics" },
  { id: "4", name: "Clothing", slug: "clothing", description: "Apparel and fashion items", parentId: null, parentName: null },
  { id: "5", name: "Men's Clothing", slug: "mens-clothing", description: "Shirts, pants for men", parentId: "4", parentName: "Clothing" },
  { id: "6", name: "Women's Clothing", slug: "womens-clothing", description: "Dresses, tops for women", parentId: "4", parentName: "Clothing" },
];

const CategoryPage: React.FC = () => {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", description: "", parentId: "" });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setCategories([...MOCK_CATEGORIES]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const getParentName = (parentId: string | null) => categories.find((c) => c.id === parentId)?.name || null;

  const handleSave = async () => {
    if (!formData.name) return;
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, ...formData, slug: generateSlug(formData.name), parentName: getParentName(formData.parentId) }
            : c
        )
      );
      toast.success(t("category.updateSuccess"));
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
        slug: generateSlug(formData.name),
        parentName: getParentName(formData.parentId),
      };
      setCategories((prev) => [...prev, newCategory]);
      toast.success(t("category.createSuccess"));
    }
    setSaving(false);
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", parentId: "" });
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setCategories((prev) => prev.filter((c) => c.id !== itemToDelete.id));
    toast.success(t("category.deleteSuccess"));
    setDeleting(false);
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const parentOptions = categories
    .filter((c) => !editingCategory || c.id !== editingCategory.id)
    .map((c) => ({ value: c.id, label: c.name }));

  const COLUMNS = useMemo(
    () => [
      { Header: t("category.name"), accessor: "name", Cell: ({ value }: any) => <span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span> },
      { Header: t("category.slug"), accessor: "slug", Cell: ({ value }: any) => <span className="font-mono text-sm text-slate-500">{value}</span> },
      { Header: t("category.description"), accessor: "description", Cell: ({ value }: any) => <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px] block">{value}</span> },
      { Header: t("category.parent"), accessor: "parentName", Cell: ({ value }: any) => value ? <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">{value}</span> : <span className="text-slate-400 italic">-</span> },
      {
        Header: t("category.actions"),
        accessor: "action",
        Cell: ({ row }: any) => {
          const category = row.original;
          return (
            <div className="flex space-x-3 rtl:space-x-reverse">
              <Tooltip content={t("common.view")}><button className="action-btn" onClick={() => { setViewingCategory(category); setShowViewModal(true); }}><Icon icon="heroicons:eye" /></button></Tooltip>
              <Tooltip content={t("common.edit")}><button className="action-btn" onClick={() => { setEditingCategory(category); setFormData({ name: category.name, description: category.description, parentId: category.parentId || "" }); setShowEditModal(true); }}><Icon icon="heroicons:pencil-square" /></button></Tooltip>
              <Tooltip content={t("common.delete")} theme="danger"><button className="action-btn" onClick={() => { setItemToDelete(category); setDeleteModalOpen(true); }}><Icon icon="heroicons:trash" /></button></Tooltip>
            </div>
          );
        },
      },
    ],
    [t]
  );

  const tableInstance = useTable({ columns: COLUMNS, data: categories }, useGlobalFilter, useSortBy, usePagination, useRowSelect);
  const { getTableProps, getTableBodyProps, headerGroups, page, nextPage, previousPage, canNextPage, canPreviousPage, pageOptions, state, gotoPage, pageCount, setPageSize, setGlobalFilter, prepareRow } = tableInstance;
  const { globalFilter, pageIndex, pageSize } = state;

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">{t("category.title")}</h4>
          <div className="md:flex md:space-x-4 md:space-y-0 space-y-2">
            <Textinput value={globalFilter || ""} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={t("category.search")} />
            <button className="btn btn-outline-dark btn-sm inline-flex items-center" onClick={fetchCategories} disabled={loading}><Icon icon="heroicons:arrow-path" className={`ltr:mr-2 ${loading ? "animate-spin" : ""}`} />{loading ? t("common.refreshing") : t("common.refresh")}</button>
            <button className="btn btn-dark btn-sm inline-flex items-center" onClick={() => { setEditingCategory(null); setFormData({ name: "", description: "", parentId: "" }); setShowAddModal(true); }}><Icon icon="heroicons:plus" className="ltr:mr-2" />{t("category.add")}</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700" {...getTableProps()}>
            <thead className="bg-slate-200 dark:bg-slate-700">
              {headerGroups.map((hg) => (
                <tr {...hg.getHeaderGroupProps()}>
                  {hg.headers.map((col: any) => <th {...col.getHeaderProps(col.getSortByToggleProps())} className="table-th">{col.render("Header")}{col.isSorted ? (col.isSortedDesc ? " 🔽" : " 🔼") : ""}</th>)}
                </tr>
              ))}
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

      {/* Add/Edit Modal */}
      <Modal title={editingCategory ? t("category.edit") : t("category.add")} activeModal={showAddModal || showEditModal} onClose={() => { setShowAddModal(false); setShowEditModal(false); }}>
        <div className="space-y-4">
          <Textinput label={t("category.name")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("category.namePlaceholder")} />
          <Select label={t("category.parent")} options={[{ value: "", label: t("category.noParent") }, ...parentOptions]} value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })} />
          <div><label className="form-label">{t("category.description")}</label><textarea className="form-control" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
          <div className="flex justify-end space-x-3">
            <button className="btn btn-outline-dark" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>{t("common.cancel")}</button>
            <button className="btn btn-dark" onClick={handleSave} disabled={saving}>{saving ? <Icon icon="heroicons:arrow-path" className="animate-spin mr-2" /> : <Icon icon="heroicons:check" className="mr-2" />}{t("common.save")}</button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal title={t("category.viewDetails")} activeModal={showViewModal} onClose={() => setShowViewModal(false)}>
        {viewingCategory && (
          <div className="space-y-4">
            <div><label className="text-sm text-slate-500">{t("category.name")}</label><p className="font-semibold text-slate-800 dark:text-slate-200">{viewingCategory.name}</p></div>
            <div><label className="text-sm text-slate-500">{t("category.slug")}</label><p className="font-mono text-sm">{viewingCategory.slug}</p></div>
            <div><label className="text-sm text-slate-500">{t("category.description")}</label><p className="text-slate-800 dark:text-slate-200">{viewingCategory.description || "-"}</p></div>
            <div><label className="text-sm text-slate-500">{t("category.parent")}</label><p>{viewingCategory.parentName || "-"}</p></div>
            <div className="flex justify-end"><button className="btn btn-dark" onClick={() => setShowViewModal(false)}>{t("common.close")}</button></div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal title={t("common.deleteConfirmTitle")} activeModal={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center"><Icon icon="heroicons:exclamation-triangle" className="text-danger-500 text-3xl" /></div>
          <p className="text-slate-600 dark:text-slate-300 mb-2">{t("common.deleteCategoryMessage")}</p>
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

export default CategoryPage;
```

## Checklist cuối ngày

- [ ] Category list hiển thị đúng
- [ ] Parent-child relationship hiển thị đúng
- [ ] Add/Edit/Delete hoạt động
- [ ] View modal hiển thị chi tiết

## Liên kết

- [Day 09: Products Module](./day-09.md) - Trước đó
- [Day 11: Brands Module](./day-11.md) - Tiếp theo
