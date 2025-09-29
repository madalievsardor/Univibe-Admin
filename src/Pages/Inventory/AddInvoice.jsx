import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { MdDelete } from "react-icons/md";
import CustomTable from "../../Components/CustomTable/CustomTable";

const AddInvoice = () => {
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };

  const { data: productsData, loading: productsLoading, error: productsError } = useFetch(
    `${apiUrl}/api/v1/products`,
    { headers: authHeaders },
    true
  );

  const [selectedProductId, setSelectedProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [source, setSource] = useState("");
  const [tempItems, setTempItems] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (productsError) {
      console.error("Products fetch error:", productsError);
      toast.error(`Не удалось загрузить продукты: ${productsError}`);
    }
    if (productsData) {
      setProducts(Array.isArray(productsData) ? productsData : []);
    }
  }, [productsData, productsError]);

  const handleAddItem = () => {
    const parsedAmount = Number(amount);
    const parsedCostPrice = Number(costPrice);
    const parsedSellingPrice = Number(sellingPrice);

    if (!selectedProductId) {
      toast.error("Пожалуйста, выберите продукт");
      return;
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Пожалуйста, введите корректное количество");
      return;
    }
    if (!costPrice || isNaN(parsedCostPrice) || parsedCostPrice <= 0) {
      toast.error("Пожалуйста, введите корректную себестоимость");
      return;
    }
    if (!sellingPrice || isNaN(parsedSellingPrice) || parsedSellingPrice <= 0) {
      toast.error("Пожалуйста, введите корректную цену продажи");
      return;
    }
    if (parsedCostPrice > parsedSellingPrice) {
      toast.error("Себестоимость не может быть больше цены продажи");
      return;
    }

    const product = products.find((p) => p._id === selectedProductId);
    const newItem = {
      productId: selectedProductId,
      productTitle: product ? product.title : "Без названия",
      amount: parsedAmount,
      costPrice: parsedCostPrice,
      sellingPrice: parsedSellingPrice,
      addedBy: addedBy || "Неизвестно",
    };

    setTempItems([...tempItems, newItem]);
    setSelectedProductId("");
    setAmount("");
    setCostPrice("");
    setSellingPrice("");
    setAddedBy("");
  };

  const handleDeleteItem = (index) => {
    setTempItems(tempItems.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!source) {
      toast.error("Укажите источник поступления");
      return;
    }
    if (tempItems.length === 0) {
      toast.error("Добавьте хотя бы один товар");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/v1/stock/add-invoice`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          source,
          date: new Date().toISOString(),
          items: tempItems,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.log("Raw response body:", text);
        let errorMessage = "Не удалось добавить накладную";
        try {
          const result = JSON.parse(text);
          errorMessage = result.message || errorMessage;
        } catch (e) {
          errorMessage = "Ошибка сервера: получен некорректный ответ";
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      toast.success("Накладная успешно добавлена");
      navigate("/stock");
    } catch (err) {
      toast.error(err.message || "Не удалось добавить накладную");
      console.error("Error:", err);
    }
  };

  const tempColumns = [
    {
      key: "productTitle",
      label: "Продукт",
      render: (value) => value || "Н/Д",
    },
    { key: "amount", label: "Количество" },
    {
      key: "costPrice",
      label: "Себестоимость",
      render: (value) => `${value.toFixed(2)} UZS`,
    },
    {
      key: "sellingPrice",
      label: "Цена продажи",
      render: (value) => `${value.toFixed(2)} UZS`,
    },
    {
      key: "addedBy",
      label: "Добавил",
      render: (value) => value || "Неизвестно",
    },
    {
      key: "actions",
      label: "Действия",
      render: (value, row, index) => (
        <button
          className="btn btn-error btn-sm"
          onClick={() => handleDeleteItem(index)}
        >
          <MdDelete className="text-lg" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="max-w-7xl bg-base-100/50 backdrop-blur-xl rounded-3xl shadow-2xl p-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 text-center">
          Добавить новое поступление
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Левая часть: Форма */}
          <div className="lg:w-1/2">
            <h3 className="text-lg font-semibold text-primary mb-4">Данные о товаре</h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-base-content">
                  Источник поступления
                </label>
                <input
                  type="text"
                  placeholder="Введите источник (например, Магазин А)"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="input input-bordered w-full bg-base-100/70"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-base-content">
                  Продукт
                </label>
                {productsLoading ? (
                  <p className="text-base-content/70">Загрузка продуктов...</p>
                ) : (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="select select-bordered w-full bg-base-100/70"
                    disabled={productsLoading || products.length === 0}
                  >
                    <option value="">Выберите продукт</option>
                    {products.length === 0 ? (
                      <option disabled>Продукты отсутствуют</option>
                    ) : (
                      products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.title || "Без названия"}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-base-content">
                  Количество
                </label>
                <input
                  type="number"
                  placeholder="Введите количество"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input input-bordered w-full bg-base-100/70"
                  min="1"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-base-content">
                  Себестоимость (UZS)
                </label>
                <input
                  type="number"
                  placeholder="Введите себестоимость"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="input input-bordered w-full bg-base-100/70"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-base-content">
                  Цена продажи (UZS)
                </label>
                <input
                  type="number"
                  placeholder="Введите цену продажи"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="input input-bordered w-full bg-base-100/70"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-base-content">
                  Добавил (необязательно)
                </label>
                <input
                  type="text"
                  placeholder="Введите имя"
                  value={addedBy}
                  onChange={(e) => setAddedBy(e.target.value)}
                  className="input input-bordered w-full bg-base-100/70"
                />
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={handleAddItem}
                disabled={productsLoading || products.length === 0}
              >
                Добавить товар в группу
              </button>
            </div>
          </div>

          {/* Правая часть: Таблица добавленных товаров */}
          <div className="lg:w-1/2">
            <h3 className="text-lg font-semibold text-primary mb-4">Добавленные товары</h3>
            <div className="max-h-[400px] overflow-y-auto">
              <CustomTable
                data={tempItems}
                columns={tempColumns}
                actions={[]}
                emptyMessage="Товары пока не добавлены"
              />
            </div>
            <button
              className="btn btn-success w-full mt-4"
              onClick={handleConfirm}
            >
              Подтвердить поступление
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;