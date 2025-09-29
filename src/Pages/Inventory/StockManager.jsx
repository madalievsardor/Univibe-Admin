import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { toast } from "react-toastify";
import { MdOutlineAddBox } from "react-icons/md";
import { motion } from "framer-motion";
import Loading from "../../Components/Loading/Loading";
import StockTable from "./StockTable";
import InvoiceDetailsModal from "./InvoiceDetailsModal";
import { groupColumns, itemColumns } from "../../utils/stockColumns";

const StockManager = () => {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("groups");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const limit = 10;

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };

  const fetchUrl =
    viewMode === "groups"
      ? `${apiUrl}/api/v1/stock/history?page=${currentPage}&limit=${limit}`
      : `${apiUrl}/api/v1/stock/history-items?page=${currentPage}&limit=${limit}`;

  const { data: receiptsData, loading, error, revalidate } = useFetch(fetchUrl, { headers: authHeaders }, false);

  useEffect(() => {
    if (token) {
      revalidate();
    } else {
      toast.error("Пожалуйста, войдите в систему");
      navigate("/login");
    }
  }, [currentPage, token, viewMode, navigate]);

  useEffect(() => {
    if (receiptsData) {
      console.log("Receipts data:", receiptsData);
    }
  }, [receiptsData]);

  useEffect(() => {
    if (error && error.includes("401")) {
      toast.error("Сессия истекла. Пожалуйста, войдите снова.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [error, navigate]);

  const data = receiptsData?.data && Array.isArray(receiptsData.data) ? receiptsData.data : [];
  const total = receiptsData?.total || 0;

  const handleRowClick = (row) => {
    setSelectedInvoice(row);
    setIsModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (!token) {
    return <div className="text-error text-center">Пожалуйста, войдите, чтобы просмотреть поступления на склад.</div>;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-error text-center">
        <p>Ошибка: {error}</p>
        <button className="btn btn-primary mt-4" onClick={() => revalidate()}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-base-100 to-base-300 p-4 sm:p-6 lg:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="max-w-7xl mx-auto bg-base-100/50 backdrop-blur-xl rounded-3xl shadow-2xl p-6"
        variants={itemVariants}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">Поступления на склад</h2>

        <div className="flex justify-between mb-4">
          <div className="tabs">
            <button
              className={`tab tab-bordered ${viewMode === "groups" ? "tab-active" : ""}`}
              onClick={() => {
                setViewMode("groups");
                setCurrentPage(1);
              }}
            >
              Группы
            </button>
            <button
              className={`tab tab-bordered ${viewMode === "items" ? "tab-active" : ""}`}
              onClick={() => {
                setViewMode("items");
                setCurrentPage(1);
              }}
            >
              Отдельные товары
            </button>
          </div>

          <Link to="/add-invoice">
            <motion.button
              className="btn btn-primary flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MdOutlineAddBox className="text-xl" />
              Новое поступление
            </motion.button>
          </Link>
        </div>

        <StockTable
          data={data}
          total={total}
          limit={limit}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          columns={viewMode === "groups" ? groupColumns : itemColumns}
          viewMode={viewMode}
          onRowClick={viewMode === "groups" ? handleRowClick : undefined}
        />

        <InvoiceDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} invoice={selectedInvoice} />
      </motion.div>
    </motion.div>
  );
};

export default StockManager;