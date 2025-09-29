import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FiRefreshCcw, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import Loading from "../../src/Components/Loading/Loading";
import { useSelector } from "react-redux";

const ClubCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({
    isAddOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    currentCategory: null,
    newName: "",
    isActionLoading: false,
  });
  const token = useSelector((state) => state.auth.user.token);

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {};

  const apiRequest = async (url, options) => {
  try {
    // console.log("Request URL:", url, "Token:", token);
    const response = await fetch(url, {
      ...options,
      headers: authHeaders,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Xatolik: ${response.status} - ${errorText || "Noma'lum xatolik"}`);
    }
    // Check if response is 204 or has no content
    if (response.status === 204 || response.headers.get("Content-Length") === "0") {
      return {};
    }
    // Only parse JSON if there's likely a body
    try {
      return await response.json();
    } catch (jsonError) {
      console.warn(`JSON parsing failed for ${url}:`, jsonError);
      return {}; // Return empty object if JSON parsing fails
    }
  } catch (err) {
    console.error(`API so'rov xatosi (${url}):`, err);
    throw err;
  }
};

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest("https://api.univibe.uz/api/v1/clubs/category/");
      const categoriesArray = Array.isArray(result) ? result : [];
      if (categoriesArray.length === 0) {
        toast.info("No categories found.");
      }
      setCategories(categoriesArray);
    } catch (err) {
      setError(
        err.message.includes("404")
          ? "Categories not found. Please check the API endpoint."
          : err.message.includes("401")
          ? "Authorization error. Please check your token."
          : `Error loading data: ${err.message}`
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCategories().finally(() => setTimeout(() => setIsRefreshing(false), 1000));
  }, [fetchCategories]);

  const openAddModal = () => {
    setModalState((prev) => ({
      ...prev,
      isAddOpen: true,
      newName: "",
    }));
  };

  const openEditModal = (category) => {
    setModalState({
      isAddOpen: false,
      isEditOpen: true,
      isDeleteOpen: false,
      currentCategory: category,
      newName: category.name,
      isActionLoading: false,
    });
  };

  const openDeleteModal = (category) => {
    setModalState({
      isAddOpen: false,
      isEditOpen: false,
      isDeleteOpen: true,
      currentCategory: category,
      newName: "",
      isActionLoading: false,
    });
  };

  const closeModal = () => {
    setModalState({
      isAddOpen: false,
      isEditOpen: false,
      isDeleteOpen: false,
      currentCategory: null,
      newName: "",
      isActionLoading: false,
    });
  };

  const handleAddCategory = async () => {
    const { newName } = modalState;

    if (!newName.trim()) {
      toast.error("Category name is required!");
      return;
    }

    setModalState((prev) => ({ ...prev, isActionLoading: true }));

    try {
      await apiRequest("https://api.univibe.uz/api/v1/clubs/category/", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim() }),
      });
      toast.success("Category added successfully!");
      await fetchCategories();
      closeModal();
    } catch (err) {
      console.error("Add category error:", err);
      let errorMessage = `Error adding category: ${err.message}`;
      if (err.message.includes("400")) {
        errorMessage = "Invalid data. Please check the entered information.";
      } else if (err.message.includes("409")) {
        errorMessage = "This category name already exists.";
      }
      toast.error(errorMessage);
    } finally {
      setModalState((prev) => ({ ...prev, isActionLoading: false }));
    }
  };

  const handleEditCategory = async () => {
    const { currentCategory, newName } = modalState;

    if (!newName.trim()) {
      toast.error("Category name is required!");
      return;
    }

    setModalState((prev) => ({ ...prev, isActionLoading: true }));

    try {
      await apiRequest(`https://api.univibe.uz/api/v1/clubs/category/${currentCategory.id}/`, {
        method: "PUT",
        body: JSON.stringify({ name: newName.trim() }),
      });
      toast.success("Category updated successfully!");
      await fetchCategories();
      closeModal();
    } catch (err) {
      console.error("Edit category error:", err);
      let errorMessage = `Error updating category: ${err.message}`;
      if (err.message.includes("400")) {
        errorMessage = "Invalid data. Please check the entered information.";
      } else if (err.message.includes("409")) {
        errorMessage = "This category name already exists.";
      }
      toast.error(errorMessage);
    } finally {
      setModalState((prev) => ({ ...prev, isActionLoading: false }));
    }
  };

  const handleDeleteCategory = async () => {
    const { currentCategory } = modalState;

    setModalState((prev) => ({ ...prev, isActionLoading: true }));
    console.log(currentCategory);
    
    try {
      await apiRequest(`https://api.univibe.uz/api/v1/clubs/category/${currentCategory.id}/`, {
        method: "DELETE",
      });
      toast.success("Category deleted successfully!");
      await fetchCategories();
      closeModal();
    } catch (err) {
      console.error("Delete category error:", err);
      toast.error(`Error deleting category: ${err.message}`);
    } finally {
      setModalState((prev) => ({ ...prev, isActionLoading: false }));
    }
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-base-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-error text-lg mb-6 font-medium">{error}</p>
        <motion.button
          className="btn btn-primary"
          onClick={fetchCategories}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-6 bg-base-100 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <motion.h1
            className="text-3xl font-bold text-base-content"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Club Categories
          </motion.h1>
          <div className="flex gap-3">
            <motion.button
              className="btn btn-primary btn-sm flex items-center gap-2"
              onClick={openAddModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus className="w-4 h-4" /> Add Category
            </motion.button>
            <motion.button
              className="btn btn-outline btn-sm flex items-center gap-2"
              onClick={handleRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiRefreshCcw className={isRefreshing ? "animate-spin w-4 h-4" : "w-4 h-4"} /> Refresh
            </motion.button>
          </div>
        </div>

        {categories.length === 0 ? (
          <motion.div
            className="text-center text-lg text-base-content/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No categories found
          </motion.div>
        ) : (
          <motion.div
            className="overflow-x-auto bg-base-200 rounded-lg shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <table className="table w-full">
              <thead>
                <tr className="bg-base-300">
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-base-100 hover:bg-base-300/50">
                    <td className="p-4">{category.id}</td>
                    <td className="p-4 font-medium">{category.name}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <motion.button
                          className="btn btn-ghost btn-sm text-primary"
                          onClick={() => openEditModal(category)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => openDeleteModal(category)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Add Modal */}
        {modalState.isAddOpen && (
          <motion.div
            className="modal modal-open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-box bg-base-200 shadow-xl max-w-md">
              <motion.h3
                className="font-bold text-lg text-base-content mb-4"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
              >
                Add New Category
              </motion.h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    className="input input-bordered w-full"
                    value={modalState.newName}
                    onChange={(e) => setModalState((prev) => ({ ...prev, newName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-action mt-6 flex justify-end gap-3">
                <motion.button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddCategory}
                  disabled={modalState.isActionLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {modalState.isActionLoading ? "Loading..." : "Add"}
                </motion.button>
                <motion.button
                  className="btn btn-outline btn-sm"
                  onClick={closeModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Edit Modal */}
        {modalState.isEditOpen && (
          <motion.div
            className="modal modal-open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-box bg-base-200 shadow-xl max-w-md">
              <motion.h3
                className="font-bold text-lg text-base-content mb-4"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
              >
                Edit Category
              </motion.h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    className="input input-bordered w-full"
                    value={modalState.newName}
                    onChange={(e) => setModalState((prev) => ({ ...prev, newName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-action mt-6 flex justify-end gap-3">
                <motion.button
                  className="btn btn-primary btn-sm"
                  onClick={handleEditCategory}
                  disabled={modalState.isActionLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {modalState.isActionLoading ? "Loading..." : "Save"}
                </motion.button>
                <motion.button
                  className="btn btn-outline btn-sm"
                  onClick={closeModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delete Modal */}
        {modalState.isDeleteOpen && (
          <motion.div
            className="modal modal-open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-box bg-base-200 shadow-xl max-w-md">
              <motion.h3
                className="font-bold text-lg text-base-content mb-4"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
              >
                Delete Category
              </motion.h3>
              <p className="mb-6">
                Are you sure you want to delete the category "{modalState.currentCategory?.name}"? This action cannot be
                undone.
              </p>
              <div className="modal-action mt-6 flex justify-end gap-3">
                <motion.button
                  className="btn btn-error btn-sm"
                  onClick={handleDeleteCategory}
                  disabled={modalState.isActionLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {modalState.isActionLoading ? "Deleting..." : "Delete"}
                </motion.button>
                <motion.button
                  className="btn btn-outline btn-sm"
                  onClick={closeModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ClubCategories;