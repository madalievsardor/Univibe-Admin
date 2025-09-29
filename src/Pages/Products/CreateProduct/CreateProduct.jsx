import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import BasicInfoSection from "../../../Components/BasicInfoSection/BasicInfoSection";
import ImagesSection from "./ImagesSection/ImagesSection";
import TechnicalSpecsSection from "./TechnicalSpecsSection/TechnicalSpecsSection";
import AdditionalInfoSection from "./AdditionalInfoSection/AdditionalInfoSection";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import useFetch from "../../../hooks/useFetch";

const CreateProduct = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm();
  const token = localStorage.getItem("token");
  const images = watch("images") || [];

  const { data: categories, error: catError, loading: catLoading } = useFetch(
    `${process.env.REACT_APP_API_URL}/api/v1/categories`,
    {},
    true
  );
  const { data: otherProducts, error: prodError, loading: prodLoading } = useFetch(
    `${process.env.REACT_APP_API_URL}/api/v1/products`,
    {},
    true
  );

  const handleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB limit per image
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error("Каждое изображение должно быть меньше 5MB");
      return;
    }

    if (files.length > 5 || images.length + files.length > 5) {
      toast.error("Можно выбрать максимум 5 изображений");
      return;
    }

    const newImages = [...images, ...files].slice(0, 5);
    setValue("images", newImages, { shouldValidate: true });
    trigger("images");
  };

  const handleCreateProduct = async (data) => {
    try {
      if (!token) {
        throw new Error("Токен авторизации отсутствует. Пожалуйста, войдите в систему.");
      }

      const requiredFields = ["title", "images", "price", "category"];
      const missingFields = requiredFields.filter((field) => {
        if (field === "images") {
          return !data.images || (Array.isArray(data.images) && data.images.length === 0);
        }
        return !data[field];
      });

      if (missingFields.length > 0) {
        throw new Error(`Заполните обязательные поля: ${missingFields.join(", ")}`);
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (data.images && data.images.some((file) => file.size > maxSize)) {
        throw new Error("Все изображения должны быть меньше 5MB");
      }

      const formData = new FormData();
      formData.append("title", data.title || "Стальные трубы высокого давления");
      formData.append("description", data.description || "Прочные стальные трубы для промышленного использования под высоким давлением.");
      formData.append("stock", data.stock || 2571);
      formData.append("price", data.price || 150000);
      formData.append("size", data.size || "1/2");
      formData.append("category", data.category || "67c5de0605ea1bafcf7d16ef");
      formData.append("material", data.material || "Сталь");
      formData.append("maxTemperature", data.maxTemperature || "120°C");
      formData.append("type", data.type || "Шовная");
      formData.append("pressure", data.pressure || 10);
      formData.append("controlType", data.controlType || "Ручное");
      formData.append("weight", data.weight || "5кг");
      // Отправляем массив идентификаторов других продуктов
      if (data.others && Array.isArray(data.others)) {
        data.others.forEach((id) => formData.append("others[]", id));
      } else {
        formData.append("others", JSON.stringify([]));
      }

      data.images.forEach((file) => formData.append("images", file));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка при создании продукта");
      }

      toast.success("Продукт успешно создан");
    } catch (error) {
      console.error("Ошибка при создании продукта:", error);
      if (error.name === "AbortError") {
        toast.error("Запрос превысил время ожидания. Проверьте сервер или уменьшите размер файлов.");
      } else if (error.message.includes("Failed to fetch")) {
        toast.error("Не удалось подключиться к серверу. Проверьте подключение к интернету.");
      } else {
        toast.error(`Не удалось создать продукт: ${error.message}`);
      }
    }
  };

  return (
    <div className="max-w-[90%] mx-auto p-4 bg-base-100 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MdOutlinePlaylistAdd className="text-3xl text-base-content" />
        Создать новый продукт
      </h2>

      <form onSubmit={handleSubmit(handleCreateProduct)} className="space-y-6">
        <BasicInfoSection
          register={register}
          errors={errors}
          categories={categories || []}
        />
        <ImagesSection
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          onImagesChange={handleImagesChange}
        />
        <TechnicalSpecsSection register={register} errors={errors} />
        <AdditionalInfoSection
          register={register}
          errors={errors}
          otherProducts={otherProducts || []}
        />

        <button type="submit" className="btn btn-primary w-full">
          <MdOutlinePlaylistAdd className="mr-2" />
          Создать
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;