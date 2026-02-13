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
import LoaderCircle from "@/components/Loader-circle";
// import { api } from "@/api";
// import { API_ENDPOINTS } from "@/core/api/endpoints";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";

// Mock categories data
const MOCK_CATEGORIES = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and gadgets including smartphones, laptops, and accessories",
    parentId: null,
    parentName: null,
  },
  {
    id: "2",
    name: "Smartphones",
    slug: "smartphones",
    description: "Mobile phones and accessories",
    parentId: "1",
    parentName: "Electronics",
  },
  {
    id: "3",
    name: "Laptops",
    slug: "laptops",
    description: "Notebook computers and accessories",
    parentId: "1",
    parentName: "Electronics",
  },
  {
    id: "4",
    name: "Clothing",
    slug: "clothing",
    description: "Apparel and fashion items for men, women, and children",
    parentId: null,
    parentName: null,
  },
  {
    id: "5",
    name: "Men's Clothing",
    slug: "mens-clothing",
    description: "Shirts, pants, and accessories for men",
    parentId: "4",
    parentName: "Clothing",
  },
  {
    id: "6",
    name: "Women's Clothing",
    slug: "womens-clothing",
    description: "Dresses, tops, and accessories for women",
    parentId: "4",
    parentName: "Clothing",
  },
];

const GlobalFilter: React.FC<{ filter, setFilter, t }> = ({ filter, setFilter, t }) => {
  const [value, setValue] = useState(filter);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setFilter(e.target.value || undefined);
  };
  return (
    <Textinput
      value={value || ""}
      onChange={onChange}
      placeholder={t("category.search")}
    />
  );
};

const CategoryPage= () => {
  const { t } = useTranslation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });
  const [addFormData, setAddFormData] = useState({
    name: "",
    description: "",
    parentId: "",
  });

  // Fetch categories from mock data
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCategories([...MOCK_CATEGORIES]);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleViewClick = (category) => {
    setViewingCategory(category);
    setShowViewModal(true);
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setEditFormData({
      name: category.name || "",
      description: category.description || "",
      parentId: category.parentId || "",
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFormChange = (field, value) => {
    setAddFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper function to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Helper function to get parent name from parentId
  const getParentName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : null;
  };

  const handleSaveEdit = async () => {
    if (!editingCategory?.id) return;

    try {
      setSaving(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedCategory = {
        ...editingCategory,
        name: editFormData.name,
        description: editFormData.description,
        slug: generateSlug(editFormData.name),
        parentId: editFormData.parentId || null,
        parentName: getParentName(editFormData.parentId || null),
      };

      // Update categories locally
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === editingCategory.id ? updatedCategory : category
        )
      );

      toast.success(t("category.updateSuccess"), {
        position: "top-right",
        autoClose: 5000,
      });

      setShowEditModal(false);
      setEditingCategory(null);
      setEditFormData({ name: "", description: "", parentId: "" });
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdd = async () => {
    try {
      setSaving(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newCategory = {
        id: Date.now().toString(),
        name: addFormData.name,
        description: addFormData.description,
        slug: generateSlug(addFormData.name),
        parentId: addFormData.parentId || null,
        parentName: getParentName(addFormData.parentId || null),
      };

      // Add new category locally
      setCategories((prevCategories) => [...prevCategories, newCategory]);

      toast.success(t("category.createSuccess"), {
        position: "top-right",
        autoClose: 5000,
      });

      setShowAddModal(false);
      setAddFormData({ name: "", description: "", parentId: "" });
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (category) => {
    setItemToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;

    try {
      setDeleting(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Remove the deleted category from the list
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== itemToDelete.id)
      );

      toast.success(t("category.deleteSuccess"), {
        position: "top-right",
        autoClose: 5000,
      });

      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setDeleting(false);
    }
  };

  const COLUMNS = useMemo(
    () => [
      {
        Header: t("category.name"),
        accessor: "name",
        Cell: (row) => (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {row?.cell?.value}
          </span>
        ),
      },
      {
        Header: t("category.slug"),
        accessor: "slug",
        Cell: (row) => (
          <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
            {row?.cell?.value}
          </span>
        ),
      },
      {
        Header: t("category.description"),
        accessor: "description",
        Cell: (row) => (
          <span className="text-slate-600 dark:text-slate-300 truncate max-w-[200px] block">
            {row?.cell?.value}
          </span>
        ),
      },
      {
        Header: t("category.parentName"),
        accessor: "parentName",
        Cell: (row) => {
          const parentName = row?.cell?.value;
          return parentName ? (
            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">
              {parentName}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-sm italic">
              {t("category.noParent")}
            </span>
          );
        },
      },
      {
        Header: t("category.actions"),
        accessor: "action",
        Cell: (row) => {
          const category = row?.row?.original;
          return (
            <div className="flex space-x-3 rtl:space-x-reverse">
              <Tooltip
                content={t("common.view")}
                placement="top"
                arrow
                animation="shift-away">
                <button
                  className="action-btn"
                  type="button"
                  onClick={() => handleViewClick(category)}>
                  <Icon icon="heroicons:eye" />
                </button>
              </Tooltip>
              <Tooltip
                content={t("common.edit")}
                placement="top"
                arrow
                animation="shift-away">
                <button
                  className="action-btn"
                  type="button"
                  onClick={() => handleEditClick(category)}>
                  <Icon icon="heroicons:pencil-square" />
                </button>
              </Tooltip>
              <Tooltip
                content={t("common.delete")}
                placement="top"
                arrow
                animation="shift-away"
                theme="danger">
                <button
                  className="action-btn"
                  type="button"
                  onClick={() => handleDeleteClick(category)}>
                  <Icon icon="heroicons:trash" />
                </button>
              </Tooltip>
            </div>
          );
        },
      },
    ],
    [t],
  );

  const data = useMemo(() => categories, [categories]);

  // Prepare parent category options for Select component
  const parentCategoryOptions = useMemo(() => {
    if (!Array.isArray(categories)) {
      return [];
    }
    const options = [];
    categories.forEach((category) => {
      // When editing, exclude the current category from parent options to prevent circular reference
      if (category && category.id && category.name) {
        if (!editingCategory || category.id !== editingCategory.id) {
          options.push({ value: category.id, label: category.name });
        }
      }
    });
    return options;
  }, [categories, editingCategory]);

  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
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

  return (
    <>
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">{t("category.title")}</h4>
          <div className="md:flex md:space-x-4 md:space-y-0 space-y-2">
            <GlobalFilter
              filter={globalFilter}
              setFilter={setGlobalFilter}
              t={t}
            />
            <button
              className="btn btn-outline-dark btn-sm inline-flex items-center"
              onClick={fetchCategories}
              disabled={loading}>
              <Icon
                icon="heroicons:arrow-path"
                className={`ltr:mr-2 rtl:ml-2 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? t("common.refreshing") : t("common.refresh")}
            </button>
            <button
              className="btn btn-dark btn-sm inline-flex items-center"
              onClick={() => setShowAddModal(true)}>
              <Icon icon="heroicons:plus" className="ltr:mr-2 rtl:ml-2" />
              {t("category.addCategory")}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700!"
                {...getTableProps()}>
                <thead className="bg-slate-200 dark:bg-slate-700">
                  {headerGroups.map((headerGroup) => {
                    const { key: headerKey, ...restHeaderProps } =
                      headerGroup.getHeaderGroupProps();
                    return (
                      <tr key={headerKey} {...restHeaderProps}>
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
                  {loading ? (
                    <tr>
                      <td
                        colSpan={headerGroups[0]?.headers?.length || 5}
                        className="table-td text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Icon
                            icon="heroicons:arrow-path"
                            className="animate-spin text-2xl text-slate-400 mb-2"
                          />
                          <span className="text-slate-500 dark:text-slate-400">
                            {t("common.loading")}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : page.length === 0 ? (
                    <tr>
                      <td
                        colSpan={headerGroups[0]?.headers?.length || 5}
                        className="table-td text-center py-8">
                        <span className="text-slate-500 dark:text-slate-400">
                          {t("category.noCategories")}
                        </span>
                      </td>
                    </tr>
                  ) : (
                    page.map((row) => {
                      prepareRow(row);
                      const { key: rowKey, ...restRowProps } =
                        row.getRowProps();
                      return (
                        <tr key={rowKey} {...restRowProps}>
                          {row.cells.map((cell) => {
                            const { key: cellKey, ...restCellProps } =
                              cell.getCellProps();
                            return (
                              <td
                                key={cellKey}
                                {...restCellProps}
                                className="table-td">
                                {cell.render("Cell")}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <select
              className="form-control py-2 w-max"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {t("common.show")} {size}
                </option>
              ))}
            </select>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {t("common.page")}{" "}
              <span>
                {pageIndex + 1} {t("common.of")} {pageOptions.length}
              </span>
            </span>
          </div>
          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}>
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>
            <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${!canPreviousPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => previousPage()}
                disabled={!canPreviousPage}>
                {t("common.previous")}
              </button>
            </li>
            {pageOptions.map((pageNum, pageIdx) => (
              <li key={pageIdx}>
                <button
                  aria-current="page"
                  className={`${
                    pageIdx === pageIndex
                      ? "bg-slate-900 dark:bg-slate-600 dark:text-slate-200 text-white font-medium"
                      : "bg-slate-100 dark:bg-slate-700 dark:text-slate-400 text-slate-900 font-normal"
                  } text-sm rounded leading-[16px] flex h-6 w-6 items-center justify-center transition-all duration-150`}
                  onClick={() => gotoPage(pageIdx)}>
                  {pageNum + 1}
                </button>
              </li>
            ))}
            <li className="text-sm leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => nextPage()}
                disabled={!canNextPage}>
                {t("common.next")}
              </button>
            </li>
            <li className="text-xl leading-4 text-slate-900 dark:text-white rtl:rotate-180">
              <button
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
                className={`${!canNextPage ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>
        </div>
      </Card>

      {/* Add Category Modal */}
      <Modal
        title={t("category.addNewCategory")}
        activeModal={showAddModal}
        onClose={() => setShowAddModal(false)}>
        <div className="space-y-4">
          <Textinput
            label={t("category.name")}
            type="text"
            placeholder={t("category.namePlaceholder")}
            value={addFormData.name}
            onChange={(e) => handleAddFormChange("name", e.target.value)}
          />
          <Select
            label={t("category.parentName")}
            placeholder={t("category.noParent")}
            options={parentCategoryOptions}
            value={addFormData.parentId || ""}
            onChange={(e) =>
              handleAddFormChange("parentId", e.target.value || "")
            }
          />
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              {t("category.description")}
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder={t("category.descriptionPlaceholder")}
              value={addFormData.description}
              onChange={(e) =>
                handleAddFormChange("description", e.target.value)
              }
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              className="btn btn-outline-dark inline-flex items-center"
              onClick={() => setShowAddModal(false)}>
              {t("common.cancel")}
            </button>
            <button
              className="btn btn-dark inline-flex items-center"
              onClick={handleSaveAdd}
              disabled={saving}>
              {saving ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="ltr:mr-2 rtl:ml-2 animate-spin"
                  />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Icon icon="heroicons:check" className="ltr:mr-2 rtl:ml-2" />
                  {t("category.saveCategory")}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title={t("category.editCategory")}
        activeModal={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
        }}>
        <div className="space-y-4">
          <Textinput
            label={t("category.name")}
            type="text"
            placeholder={t("category.namePlaceholder")}
            value={editFormData.name}
            onChange={(e) => handleEditFormChange("name", e.target.value)}
          />
          <Select
            label={t("category.parentName")}
            placeholder={t("category.noParent")}
            options={parentCategoryOptions}
            value={editFormData.parentId || ""}
            onChange={(e) =>
              handleEditFormChange("parentId", e.target.value || "")
            }
          />
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              {t("category.description")}
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder={t("category.descriptionPlaceholder")}
              value={editFormData.description}
              onChange={(e) =>
                handleEditFormChange("description", e.target.value)
              }
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              className="btn btn-outline-dark inline-flex items-center"
              onClick={() => {
                setShowEditModal(false);
                setEditingCategory(null);
              }}>
              {t("common.cancel")}
            </button>
            <button
              className="btn btn-dark inline-flex items-center"
              onClick={handleSaveEdit}
              disabled={saving}>
              {saving ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="ltr:mr-2 rtl:ml-2 animate-spin"
                  />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Icon icon="heroicons:check" className="ltr:mr-2 rtl:ml-2" />
                  {t("category.updateCategory")}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={t("common.deleteConfirmTitle")}
        activeModal={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-500/20 flex items-center justify-center">
            <Icon
              icon="heroicons:exclamation-triangle"
              className="text-danger-500 text-3xl"
            />
          </div>
          <p className="text-slate-600 dark:text-slate-300 mb-2">
            {t("common.deleteCategoryMessage")}
          </p>
          {itemToDelete && (
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-6">
              "{itemToDelete.name}"
            </p>
          )}
          <div className="flex justify-center space-x-3">
            <button
              className="btn btn-outline-dark inline-flex items-center"
              onClick={() => {
                setDeleteModalOpen(false);
                setItemToDelete(null);
              }}>
              {t("common.cancel")}
            </button>
            <button
              className="btn btn-danger inline-flex items-center"
              onClick={confirmDelete}
              disabled={deleting}>
              {deleting ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="ltr:mr-2 rtl:ml-2 animate-spin"
                  />
                  {t("common.loading")}
                </>
              ) : (
                <>
                  <Icon icon="heroicons:trash" className="ltr:mr-2 rtl:ml-2" />
                  {t("common.delete")}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Category Detail Modal */}
      <Modal
        title={t("category.viewDetails")}
        activeModal={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingCategory(null);
        }}>
        {viewingCategory && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t("category.name")}
              </label>
              <p className="text-slate-800 dark:text-slate-200 font-semibold">
                {viewingCategory.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t("category.slug")}
              </label>
              <p className="text-slate-800 dark:text-slate-200 font-mono text-sm">
                {viewingCategory.slug}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t("category.description")}
              </label>
              <p className="text-slate-800 dark:text-slate-200">
                {viewingCategory.description || t("category.noDescription")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                {t("category.parentName")}
              </label>
              {viewingCategory.parentName ? (
                <span className="inline-block bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded text-sm font-medium">
                  {viewingCategory.parentName}
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-sm italic">
                  {t("category.noParent")}
                </span>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <button
                className="btn btn-dark inline-flex items-center"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingCategory(null);
                }}>
                {t("common.close")}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CategoryPage;
