import React from "react";
import { MdClose } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import CustomTable from "./CustomTable";
import { nestedColumns } from "../utils/stockColumns";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

const InvoiceDetailsModal = ({ isOpen, onClose, invoice }) => {
  if (!invoice) return null;

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleString("ru-RU", {
          timeZone: "Asia/Tashkent",
          hour12: false,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "Н/Д";

  const totalCost = (invoice.items?.reduce((sum, item) => sum + (item.costPrice || 0) * (item.amount || 0), 0) || 0).toFixed(2);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-base-100 rounded-3xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-primary">Детали накладной</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-base-content/70">ID накладной:</p>
                  <p className="text-base-content">{invoice._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/70">Источник:</p>
                  <p className="text-base-content">{invoice.source || "Не указано"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/70">Дата:</p>
                  <p className="text-base-content">{formatDate(invoice.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/70">Общее количество товаров:</p>
                  <p className="text-base-content">{invoice.items?.length || 0} товаров</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/70">Общая стоимость:</p>
                  <p className="text-base-content">{totalCost} UZS</p>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-primary mb-2">Товары в накладной</h4>
            <CustomTable
              data={invoice.items || []}
              columns={nestedColumns}
              actions={[]}
              emptyMessage="Товары отсутствуют"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InvoiceDetailsModal;