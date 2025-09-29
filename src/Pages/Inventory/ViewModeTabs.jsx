import { motion } from "framer-motion";

const ViewModeTabs = ({ viewMode, setViewMode, setCurrentPage }) => {
  return (
    <div role="tablist" className="tabs tabs-boxed py-2 px-4">
      <motion.a
        role="tab"
        className={`tab ${viewMode === "groups" ? "tab-active" : ""}`}
        onClick={() => {
          setViewMode("groups");
          setCurrentPage(1);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Группы
      </motion.a>
      <motion.a
        role="tab"
        className={`tab ${viewMode === "items" ? "tab-active" : ""}`}
        onClick={() => {
          setViewMode("items");
          setCurrentPage(1);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Отдельные товары
      </motion.a>
    </div>
  );
};

export default ViewModeTabs;