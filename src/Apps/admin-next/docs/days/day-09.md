# Day 09: Products Module

## Mục tiêu

Xây dựng Products Module với react-table:
- Product List với đầy đủ features
- Pagination, Sorting, Filtering
- CRUD operations

## Product List Component - `src/components/partials/product/product-list.tsx`

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
import { formatCurrency } from "@/utils/format";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
  Column,
} from "react-table";

type ProductStatus = "active" | "out_of_stock" | "in_stock" | "draft" | "hidden";

interface Product {
  id: string;
  name: string;
  sku: string;
  categories: string;
  brand: string;
  price: number;
  salePrice: number | null;
  published: boolean;
  featured: boolean;
  image: string;
  status: ProductStatus;
}

interface GlobalFilterProps {
  filter: string;
  setFilter: (value: string | undefined) => void;
  t: (key: string) => string;
}

const GlobalFilter: React.FC<GlobalFilterProps> = ({ filter, setFilter, t }) => {
  const [value, setValue] = useState<string>(filter || "");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setFilter(e.target.value || undefined);
  };
  return (
    <Textinput
      value={value || ""}
      onChange={onChange}
      placeholder={t("products.search")}
    />
  );
};

// Mock products data
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    sku: "IP15PM-256",
    categories: "Điện thoại, Apple",
    brand: "Apple",
    price: 34990000,
    salePrice: 32990000,
    published: true,
    featured: true,
    image: "https://placehold.co/60x60/e2e8f0/475569?text=iPhone",
    status: "active",
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra 512GB",
    sku: "SS-S24U-512",
    categories: "Điện thoại, Samsung",
    brand: "Samsung",
    price: 32990000,
    salePrice: null,
    published: true,
    featured: true,
    image: "https://placehold.co/60x60/e2e8f0/475569?text=Samsung",
    status: "active",
  },
  {
    id: "3",
    name: "MacBook Pro 14 inch M3 Pro",
    sku: "MBP14-M3P",
    categories: "Laptop, Apple",
    brand: "Apple",
    price: 52990000,
    salePrice: 49990000,
    published: true,
    featured: false,
    image: "https://placehold.co/60x60/e2e8f0/475569?text=MacBook",
    status: "active",
  },
  {
    id: "4",
    name: "AirPods Pro 2",
    sku: "APP-PRO2",
    categories: "Phụ kiện, Apple",
    brand: "Apple",
    price: 5990000,
    salePrice: null,
    published: false,
    featured: false,
    image: "https://placehold.co/60x60/e2e8f0/475569?text=AirPods",
    status: "hidden",
  },
  {
    id: "5",
    name: "Sony WH-1000XM5",
    sku: "SONY-XM5",
    categories: "Phụ kiện, Sony",
    brand: "Sony",
    price: 8990000,
    salePrice: 7990000,
    published: true,
    featured: false,
    image: "https://placehold.co/60x60/e2e8f0/475569?text=Sony",
    status: "out_of_stock",
  },
];

const ProductList: React.FC = () => {
  const { t } = useTranslation();
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [publishModalOpen, setPublishModalOpen] = useState<boolean>(false);
  const [itemToPublish, setItemToPublish] = useState<Product | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProducts(MOCK_PRODUCTS);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteClick = (product: Product) => {
    setItemToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;
    try {
      setDeleting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(t("products.deleteSuccess"), { position: "top-right", autoClose: 3000 });
      setProducts((prev) => prev.filter((p) => p.id !== itemToDelete.id));
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  const handlePublishClick = (product: Product) => {
    setItemToPublish(product);
    setPublishModalOpen(true);
  };

  const confirmPublish = async () => {
    if (!itemToPublish?.id) return;
    try {
      setPublishing(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const isPublished = itemToPublish.published;
      toast.success(isPublished ? t("products.unpublishSuccess") : t("products.publishSuccess"), {
        position: "top-right",
        autoClose: 3000,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === itemToPublish.id ? { ...p, published: !isPublished } : p))
      );
      setPublishModalOpen(false);
    } finally {
      setPublishing(false);
      setItemToPublish(null);
    }
  };

  const COLUMNS: Column<Product>[] = useMemo(
    () => [
      {
        Header: t("products.product"),
        accessor: "name",
        Cell: ({ row }: any) => {
          const product = row.original;
          return (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <Link href={`/products/${product.id}`} className="font-medium text-slate-800 dark:text-slate-200 hover:text-primary-500 truncate block max-w-[250px]">
                  {product.name}
                </Link>
                <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
              </div>
            </div>
          );
        },
      },
      {
        Header: t("products.brand"),
        accessor: "brand",
        Cell: ({ value }: any) => (
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">{value}</span>
        ),
      },
      {
        Header: t("products.category"),
        accessor: "categories",
        Cell: ({ value }: any) => (
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">{value}</span>
        ),
      },
      {
        Header: t("products.price"),
        accessor: "price",
        Cell: ({ row }: any) => {
          const product = row.original;
          return product.salePrice ? (
            <div>
              <span className="font-semibold text-danger-500">{formatCurrency(product.salePrice)}</span>
              <span className="text-xs text-slate-400 line-through block">{formatCurrency(product.price)}</span>
            </div>
          ) : (
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(product.price)}</span>
          );
        },
      },
      {
        Header: t("products.publish"),
        accessor: "published",
        Cell: ({ value }: any) => (
          <span className={`font-medium ${value ? "text-success-500" : "text-danger-500"}`}>
            {value ? t("products.published") : t("products.unpublished")}
          </span>
        ),
      },
      {
        Header: t("products.status"),
        accessor: "status",
        Cell: ({ value }: any) => {
          const statusConfig: Record<string, { label: string; class: string }> = {
            active: { label: t("products.active"), class: "text-success-500 bg-success-500/30" },
            out_of_stock: { label: t("products.outOfStock"), class: "text-danger-500 bg-danger-500/30" },
            in_stock: { label: t("products.inStock"), class: "text-success-500 bg-success-500/30" },
            draft: { label: t("products.draft"), class: "text-warning-500 bg-warning-500/30" },
            hidden: { label: t("products.hidden"), class: "text-slate-500 bg-slate-500/30" },
          };
          const config = statusConfig[value] || statusConfig.active;
          return (
            <span className={`inline-block px-3 min-w-[80px] text-center py-1 rounded-full text-sm ${config.class}`}>
              {config.label}
            </span>
          );
        },
      },
      {
        Header: t("products.actions"),
        accessor: "action",
        Cell: ({ row }: any) => {
          const product = row.original;
          return (
            <div className="flex space-x-3 rtl:space-x-reverse">
              <Tooltip content={t("common.view")} placement="top" arrow>
                <Link href={`/products/${product.id}`} className="action-btn">
                  <Icon icon="heroicons:eye" />
                </Link>
              </Tooltip>
              <Tooltip content={t("common.edit")} placement="top" arrow>
                <Link href={`/edit-product/${product.id}`} className="action-btn">
                  <Icon icon="heroicons:pencil-square" />
                </Link>
              </Tooltip>
              <Tooltip content={product.published ? t("products.unpublish") : t("products.publish")} placement="top" arrow>
                <button className="action-btn" onClick={() => handlePublishClick(product)}>
                  <Icon icon={product.published ? "heroicons:lock-closed" : "heroicons:globe-alt"} />
                </button>
              </Tooltip>
              <Tooltip content={t("common.delete")} placement="top" arrow theme="danger">
                <button className="action-btn" onClick={() => handleDeleteClick(product)}>
                  <Icon icon="heroicons:trash" />
                </button>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [t]
  );

  const tableInstance = useTable(
    { columns: COLUMNS, data: products },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state,
    gotoPage,
    pageCount,
    setPageSize,
    setGlobalFilter,
    prepareRow,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;

  // Status counts
  const statusCounts = useMemo(() => ({
    all: products.length,
    published: products.filter((p) => p.published).length,
    unpublished: products.filter((p) => !p.published).length,
    out_of_stock: products.filter((p) => p.status === "out_of_stock").length,
  }), [products]);

  return (
    <div className="space-y-5">
      {/* Status Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "all", label: t("products.all"), icon: "heroicons:squares-2x2", color: "bg-slate-500" },
          { key: "published", label: t("products.published"), icon: "heroicons:check-circle", color: "bg-success-500" },
          { key: "unpublished", label: t("products.unpublished"), icon: "heroicons:document", color: "bg-warning-500" },
          { key: "out_of_stock", label: t("products.outOfStock"), icon: "heroicons:x-circle", color: "bg-danger-500" },
        ].map((item) => (
          <button
            key={item.key}
            className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center`}>
                <Icon icon={item.icon} className="text-white text-xl" />
              </div>
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{statusCounts[item.key as keyof typeof statusCounts]}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 text-left">{item.label}</p>
          </button>
        ))}
      </div>

      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">{t("products.title")}</h4>
          <div className="md:flex md:space-x-4 md:space-y-0 space-y-2 mt-4 md:mt-0">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} t={t} />
            <button className="btn btn-outline-dark btn-sm inline-flex items-center" onClick={fetchProducts} disabled={loading}>
              <Icon icon="heroicons:arrow-path" className={`ltr:mr-2 rtl:ml-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? t("common.refreshing") : t("common.refresh")}
            </button>
            <Link href="/create-product" className="btn btn-dark btn-sm inline-flex items-center">
              <Icon icon="heroicons:plus" className="ltr:mr-2 rtl:ml-2" />
              {t("products.createNew")}
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700" {...getTableProps()}>
            <thead className="bg-slate-200 dark:bg-slate-700">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column: any) => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())} className="table-th">
                      {column.render("Header")}
                      <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700" {...getTableBodyProps()}>
              {loading ? (
                <tr>
                  <td colSpan={7} className="table-td text-center py-8">
                    <Icon icon="heroicons:arrow-path" className="animate-spin text-2xl text-slate-400 mx-auto" />
                  </td>
                </tr>
              ) : page.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-td text-center py-8">{t("products.noProducts")}</td>
                </tr>
              ) : (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="table-td">{cell.render("Cell")}</td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="md:flex justify-between items-center mt-6">
          <div className="flex items-center space-x-3">
            <select className="form-control py-2 w-max" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>{t("common.show")} {size}</option>
              ))}
            </select>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {t("common.page")} {pageIndex + 1} {t("common.of")} {pageOptions.length}
            </span>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="btn btn-sm btn-outline-dark">
              <Icon icon="heroicons:chevron-double-left" />
            </button>
            <button onClick={() => previousPage()} disabled={!canPreviousPage} className="btn btn-sm btn-outline-dark">
              {t("common.previous")}
            </button>
            {pageOptions.map((pageNum, idx) => (
              <button
                key={idx}
                onClick={() => gotoPage(idx)}
                className={`btn btn-sm ${pageIndex === idx ? "btn-dark" : "btn-outline-dark"}`}
              >
                {pageNum + 1}
              </button>
            ))}
            <button onClick={() => nextPage()} disabled={!canNextPage} className="btn btn-sm btn-outline-dark">
              {t("common.next")}
            </button>
            <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="btn btn-sm btn-outline-dark">
              <Icon icon="heroicons:chevron-double-right" />
            </button>
          </div>
        </div>
      </Card>

      {/* Delete Modal */}
      <Modal title={t("common.deleteConfirmTitle")} activeModal={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
            <Icon icon="heroicons:exclamation-triangle" className="text-danger-500 text-3xl" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-2">{t("common.deleteProductMessage")}</p>
          {itemToDelete && <p className="font-semibold text-slate-800 dark:text-slate-200 mb-6">"{itemToDelete.name}"</p>}
          <div className="flex justify-center space-x-3">
            <button className="btn btn-outline-dark" onClick={() => setDeleteModalOpen(false)}>{t("common.cancel")}</button>
            <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <Icon icon="heroicons:arrow-path" className="animate-spin mr-2" /> : <Icon icon="heroicons:trash" className="mr-2" />}
              {t("common.delete")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductList;
```

## Checklist cuối ngày

- [ ] Product list hiển thị đúng
- [ ] Pagination hoạt động đúng
- [ ] Sorting hoạt động đúng
- [ ] Global filter hoạt động đúng
- [ ] Delete confirmation modal hoạt động
- [ ] Publish/Unpublish hoạt động

## Liên kết

- [Day 08: Dashboard Layout](./day-08.md) - Trước đó: Dashboard Layout
- [Day 10: Categories Module](./day-10.md) - Tiếp theo: Categories Module
