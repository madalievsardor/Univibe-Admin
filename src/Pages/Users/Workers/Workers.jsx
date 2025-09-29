import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FiRefreshCcw } from "react-icons/fi";
import { toast } from "react-toastify";
import Loading from "../../../Components/Loading/Loading";
import { useSelector } from "react-redux";
import CustomPagination from "../../../Components/CustomPagination/CustomPagination";

const ShopHistory = () => {
  const [orders, setOrders] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector((state) => state.auth.user.token);
  const [statusProduct, setStatusProduct] = useState("pending")

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Canceled", value: "canceled" },
    { label: "Returned", value: "returned" },
  ];

  const authHeaders = token
    ? {
      Authorization: `Bearer ${token}`,
    }
    : {};

  const apiRequest = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} - ${errorText || "Unknown error"}`);
      }
      return await response.json();
    } catch (err) {
      console.error(`API request error (${url}):`, err);
      throw err;
    }
  };

  const fetchPendingOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest(
        `https://api.univibe.uz/api/v1/shop/history/filter/?status=${statusProduct}&page=${currentPage}&page_size=10`
      );
      const ordersArray = Array.isArray(result.results) ? result.results : [];
      setOrders(ordersArray);
      console.log(result);

      setTotalPages(Math.ceil(result.count / 10) || 1); // зависит от API, может быть `result.count / 10`
    } catch (err) {
      setError(
        err.message.includes("404")
          ? "Orders not found. Please check the API endpoint."
          : err.message.includes("401")
            ? "Authorization error. Please check your token."
            : `Error loading data: ${err.message}`
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusProduct, currentPage]);


  useEffect(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPendingOrders().finally(() => setTimeout(() => setIsRefreshing(false), 1000));
  }, [fetchPendingOrders]);

  const updateOrderStatus = async (shopCode, newStatus) => {

    const statusMap = {
      2: "confirmed",
      3: "canceled",
      4: "returned",
    };

    const statusValue = statusMap[newStatus];

    if (!statusValue) {
      console.error("Invalid status code:", newStatus);
      return;
    }

    try {
      await apiRequest(
        `https://api.univibe.uz/api/v1/shop/shop-history/update/${shopCode}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: statusValue }),
        }
      );

      toast.success(`Order ${statusValue} successfully!`);
      await fetchPendingOrders();
    } catch (err) {
      console.error("Update order status error:", err);
      toast.error(`Failed to update order status: ${err.message}`);
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
          onClick={fetchPendingOrders}
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
            Pending Orders
          </motion.h1>
          <motion.button
            className="btn btn-outline btn-sm flex items-center gap-2"
            onClick={handleRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCcw className={isRefreshing ? "animate-spin w-4 h-4" : "w-4 h-4"} /> Refresh
          </motion.button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {statusOptions.map((option) => (
            <motion.button
              key={option.value}
              className={`btn btn-sm ${statusProduct === option.value ? "btn-primary text-base-100" : "btn-outline"
                }`}
              onClick={() => {
                setStatusProduct(option.value);
                setCurrentPage(1);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>

        {orders.length === 0 ? (
          <motion.div
            className="text-center text-lg text-base-content/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No pending orders found
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {orders.map((order) => (
              <motion.div
                key={order.id}
                className="card bg-base-200 shadow-xl rounded-lg overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="card-body p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <img
                        src={
                          `https://api.univibe.uz${order.product_id.img}`
                        }
                        alt={order.product?.name || "Product"}
                        className="w-32 h-32 object-cover rounded-lg"
                        // onError={(e) => {
                        //   e.target.src = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-2.jpg";
                        // }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h2 className="card-title text-xl font-bold text-base-content mb-2">
                        {order.product_id?.name || "Unknown Product"}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-base-content/70">Order ID:</p>
                          <p className="font-medium">#{order.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-base-content/70">Price:</p>
                          <p className="font-medium">💰 {order.product_id?.cost || 0} coins</p>
                        </div>
                        <div>
                          <p className="text-sm text-base-content/70">User:</p>
                          <p className="font-medium">
                            {order.user_id?.name || "Unknown"} {order.user_id?.surname || "User"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-base-content/70">Order Date:</p>
                          <p className="font-medium">
                            {new Date(order.time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {statusProduct == "confirmed" ?
                          <motion.button
                            className="btn btn-warning btn-sm text-base-100"
                            onClick={() => updateOrderStatus(order.shop_code, 4)} // 4 = Returned
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Mark as Returned
                          </motion.button>
                          :
                          statusProduct == "pending" ?
                            <>
                              <motion.button
                                className="btn btn-success btn-sm text-base-100"
                                onClick={() => updateOrderStatus(order.shop_code, 2)} // 2 = Confirmed
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Confirm Order
                              </motion.button>
                              <motion.button
                                className="btn btn-error btn-sm text-base-100"
                                onClick={() => updateOrderStatus(order.shop_code, 3)} // 3 = Canceled
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Cancel Order
                              </motion.button>
                              <motion.button
                                className="btn btn-warning btn-sm text-base-100"
                                onClick={() => updateOrderStatus(order.shop_code, 4)} // 4 = Returned
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Mark as Returned
                              </motion.button>
                            </>
                            :
                            ""
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        {totalPages > 1 && (
          <motion.div className="mt-6 flex justify-center">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              className="btn-group"
            />
          </motion.div>
        )}
      </div>

    </motion.div>
  );
};

export default ShopHistory;