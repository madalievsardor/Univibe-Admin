import { MdOpenInNew } from "react-icons/md";

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

const formatCurrency = (value) => (value ? `${value.toFixed(2)} UZS` : "Н/Д");

export const groupColumns = [
  {
    key: "source",
    label: "Источник",
    render: (value) => value || "Не указано",
  },
  {
    key: "date",
    label: "Дата",
    render: formatDate,
  },
  {
    key: "itemsCount",
    label: "Количество товаров",
    render: (value, row) => `${row.items?.length || 0} товаров`,
  },
  {
    key: "totalCost",
    label: "Общая стоимость",
    render: (value, row) =>
      formatCurrency(
        row.items?.reduce(
          (sum, item) => sum + (item.costPrice || 0) * (item.amount || 0),
          0
        ) || 0
      ),
  },
  {
    key: "actions",
    label: "Действия",
    render: (value, row, handleRowClick) => (
      <div className="flex gap-2">
        <button
          className="btn btn-sm btn-primary"
          onClick={() => handleRowClick(row)}
        >
          Открыть <MdOpenInNew />
        </button>
      </div>
    ),
  },
];

export const itemColumns = [
  {
    key: "productTitle",
    label: "Продукт",
    render: (value, row) => row.product?.title || "Н/Д",
  },
  { key: "amount", label: "Количество" },
  {
    key: "costPrice",
    label: "Себестоимость",
    render: formatCurrency,
  },
  {
    key: "sellingPrice",
    label: "Цена продажи",
    render: formatCurrency,
  },
  {
    key: "addedBy",
    label: "Добавил",
    render: (value) => value || "Неизвестно",
  },
  {
    key: "invoiceSource",
    label: "Источник",
    render: (value, row) => row.invoice?.source || "Не указано",
  },
  {
    key: "createdAt",
    label: "Дата",
    render: formatDate,
  },
];

export const nestedColumns = [
  {
    key: "productTitle",
    label: "Продукт",
    render: (value, row) => row.product?.title || "Н/Д",
  },
  { key: "amount", label: "Количество" },
  {
    key: "costPrice",
    label: "Себестоимость",
    render: formatCurrency,
  },
  {
    key: "sellingPrice",
    label: "Цена продажи",
    render: formatCurrency,
  },
  {
    key: "addedBy",
    label: "Добавил",
    render: (value) => value || "Неизвестно",
  },
];