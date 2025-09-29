import React from "react";
import { motion } from "framer-motion";
import CustomTable from "./CustomTable";
import CustomPagination from "./CustomPagination";

const StockTable = ({ data, total, limit, currentPage, onPageChange, columns, viewMode, onRowClick }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <>
      <motion.div variants={itemVariants}>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-base-content/70">
              {viewMode === "groups" ? "Накладные не найдены" : "Товары не найдены"}
            </p>
            <p className="text-sm text-base-content/50 mt-2">
              Попробуйте добавить новое поступление, чтобы начать.
            </p>
          </div>
        ) : (
          <CustomTable
            data={data}
            columns={columns}
            actions={[]}
            emptyMessage={viewMode === "groups" ? "Накладные не найдены" : "Товары не найдены"}
            onRowClick={onRowClick}
          />
        )}
      </motion.div>

      {total > 0 && (
        <motion.div variants={itemVariants}>
          <CustomPagination
            currentPage={currentPage}
            totalPages={Math.ceil(total / limit)}
            onPageChange={onPageChange}
          />
        </motion.div>
      )}
    </>
  );
};

export default StockTable;