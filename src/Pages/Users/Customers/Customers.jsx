import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FiRefreshCcw, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import Loading from "../../../Components/Loading/Loading";
import { useSelector } from "react-redux";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({
    isAddOpen: false,
    newName: "",
    newCost: "",
    newQuantity: "",
    newImage: null,
    isActionLoading: false,
  });
  const token = useSelector((state) => state.auth.user.token);

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const apiRequest = async (url, options) => {
    try {
      console.log("Request URL:", url, "Token:", token);
      const response = await fetch(url, {
        ...options,
        headers: {
          ...authHeaders,
          ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Xatolik: ${response.status} - ${errorText || "Noma'lum xatolik"}`);
      }
      return await response.json();
    } catch (err) {
      console.error(`API so'rov xatosi (${url}):`, err);
      throw err;
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest("https://api.univibe.uz/api/v1/shop/products/", {
        method: "GET",
      });
      const productsArray = Array.isArray(result) ? result : Array.isArray(result.results) ? result.results : [];
      if (productsArray.length === 0) {
        toast.info("Mahsulotlar topilmadi.");
      }
      setProducts(productsArray);
    } catch (err) {
      setError(
        err.message.includes("404")
          ? "Mahsulotlar topilmadi. Iltimos, API manzilini tekshiring."
          : err.message.includes("401")
          ? "Avtorizatsiya xatosi. Tokenni tekshiring."
          : `Ma'lumotlarni yuklashda xatolik: ${err.message}`
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchProducts().finally(() => setTimeout(() => setIsRefreshing(false), 1000));
  }, [fetchProducts]);

  const openAddModal = () => {
    setModalState((prev) => ({
      ...prev,
      isAddOpen: true,
      newName: "",
      newCost: "",
      newQuantity: "",
      newImage: null,
    }));
  };

  const closeModal = () => {
    setModalState({
      isAddOpen: false,
      newName: "",
      newCost: "",
      newQuantity: "",
      newImage: null,
      isActionLoading: false,
    });
  };

  const handleAddProduct = async () => {
    const { newName, newCost, newQuantity, newImage } = modalState;

    if (!newName.trim() || !newCost.trim() || !newQuantity.trim() || !newImage) {
      toast.error("Barcha maydonlar to‘ldirilishi shart, shu jumladan rasm!");
      return;
    }

    const costValue = Number(newCost);
    const quantityValue = Number(newQuantity);
    if (isNaN(costValue) || costValue <= 0 || isNaN(quantityValue) || quantityValue <= 0) {
      toast.error("Cost va quantity musbat son bo‘lishi kerak!");
      return;
    }

    setModalState((prev) => ({ ...prev, isActionLoading: true }));

    try {
      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("cost", costValue);
      formData.append("quantity", quantityValue);
      formData.append("img", newImage); // Changed from "image" to "img" to match API expectation

      await apiRequest("https://api.univibe.uz/api/v1/shop/products/create/", {
        method: "POST",
        body: formData,
      });
      toast.success("Mahsulot muvaffaqiyatli qo‘shildi!");
      await fetchProducts();
      closeModal();
    } catch (err) {
      console.error("Add product error:", err);
      let errorMessage = `Qo‘shishda xatolik: ${err.message}`;
      if (err.message.includes("400")) {
        errorMessage = "Ma'lumotlar noto‘g‘ri. Iltimos, kiritilgan ma'lumotlarni tekshiring, rasmni tekshiring.";
      } else if (err.message.includes("409")) {
        errorMessage = "Bu mahsulot nomi allaqachon mavjud.";
      }
      toast.error(errorMessage);
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
          onClick={fetchProducts}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Qayta urinish
        </motion.button>
      </motion.div>
    );
  }

  console.log(products);
  
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
            Shop Products
          </motion.h1>
          <div className="flex gap-3">
            <motion.button
              className="btn btn-primary btn-sm flex items-center gap-2"
              onClick={openAddModal}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus className="w-4 h-4" /> Add Product
            </motion.button>
            <motion.button
              className="btn btn-outline btn-sm flex items-center gap-2"
              onClick={handleRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiRefreshCcw className={isRefreshing ? "animate-spin w-4 h-4" : "w-4 h-4"} /> Yangilash
            </motion.button>
          </div>
        </div>

        {products.length === 0 ? (
          <motion.div
            className="text-center text-lg text-base-content/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Mahsulotlar topilmadi
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="card bg-base-200 shadow-xl rounded-lg overflow-hidden"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <img
                    src={
                      product?.img
                        ? `${product.img}`
                        : "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-2.jpg"
                    }
                    alt={product.name || "Mahsulot"}
                    className="w-full h-56 object-cover"
                    onError={(e) => {
                      e.target.src = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-2.jpg";
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-sm font-semibold">
                    💰 {product.cost || 0} coin
                  </div>
                </div>
                <div className="card-body p-4 text-center">
                  <h2 className="card-title text-lg font-bold text-base-content">
                    {product.name || "Nomsiz mahsulot"}
                  </h2>
                  <p className="text-base-content/70">{product.quantity || 0} ta qoldi</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {modalState.isAddOpen && (
          <motion.div
            className="modal modal-open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-box bg-base-200 shadow-xl max-w-lg">
              <motion.h3
                className="font-bold text-lg text-base-content mb-4"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
              >
                Yangi mahsulot qo‘shish
              </motion.h3>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Mahsulot nomi</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Mahsulot nomini kiriting"
                    className="input input-bordered w-full"
                    value={modalState.newName}
                    onChange={(e) => setModalState((prev) => ({ ...prev, newName: e.target.value }))}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Cost (Coin)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Cost qiymatini kiriting"
                    className="input input-bordered w-full"
                    value={modalState.newCost}
                    onChange={(e) => setModalState((prev) => ({ ...prev, newCost: e.target.value }))}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Quantity (ta)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Quantity kiriting"
                    className="input input-bordered w-full"
                    value={modalState.newQuantity}
                    onChange={(e) => setModalState((prev) => ({ ...prev, newQuantity: e.target.value }))}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Rasm</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input file-input-bordered w-full"
                    onChange={(e) => setModalState((prev) => ({ ...prev, newImage: e.target.files[0] }))}
                  />
                </div>
              </div>
              <div className="modal-action mt-6 flex justify-end gap-3">
                <motion.button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddProduct}
                  disabled={modalState.isActionLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {modalState.isActionLoading ? "Yuklanmoqda..." : "Qo‘shish"}
                </motion.button>
                <motion.button
                  className="btn btn-outline btn-sm"
                  onClick={closeModal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Bekor qilish
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Shop;