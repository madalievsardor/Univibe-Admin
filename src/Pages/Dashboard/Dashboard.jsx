import React, { act, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, A11y, Scrollbar } from 'swiper/modules';
import { motion } from "framer-motion";


// Импорт стилей Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FiPlus, FiRefreshCcw, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalState, setModalState] = useState({
    isAddOpen: false,
    newImage: null,
    newUrl: "",
    newTitle: "",
    newDescription: "",
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

  const fetchBanners = async () => {
    try {
      if (!token) {
        throw new Error("Токен  xаутентификации не найден");
      }

      const response = await axios.get(
        'https://api.univibe.uz/api/v1/news/staff/banner/',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBanners(response.data || []);
    } catch (error) {
      console.error("Ошибка при получении данных:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setModalState((prev) => ({
      ...prev,
      isAddOpen: true,
      newImage: null,
      newUrl: "",
      newTitle: "",
      newDescription: "",
    }));
  };

  const closeModal = () => {
    setModalState({
      isAddOpen: false,
      newImage: null,
      newUrl: "",
      newTitle: "",
      newDescription: "",
      isActionLoading: false,
    });
  };

  const handleAddBanner = async () => {
    const { newUrl, newTitle, newDescription, newImage } = modalState;

    if (!newTitle.trim() || !newDescription.trim() || !newImage) {
      toast.error("Barcha maydonlar to‘ldirilishi shart, shu jumladan rasm!");
      return;
    }

    setModalState((prev) => ({ ...prev, isActionLoading: true }));

    try {
      const formData = new FormData();
      formData.append("banner", newImage); // Changed from "image" to "img" to match API expectation
      formData.append("url", newUrl.trim());
      formData.append("title", newTitle);
      formData.append("description", newDescription);

      await apiRequest("https://api.univibe.uz/api/v1/news/staff/banner/", {
        method: "POST",
        body: formData,
      });
      toast.success("Mahsulot muvaffaqiyatli qo‘shildi!");
      closeModal();
    } catch (err) {
      console.error("Add banner error:", err);
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

  const deleteBanner = async (id) => {
    if (!window.confirm("Delete this club?")) return;

    try {
      const res = await fetch(`https://api.univibe.uz/api/v1/news/staff/banner/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 204) {
        toast.success("Club deleted!");
        fetchBanners();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  }

  // const handleRefresh = useCallback(() => {
  //   setIsRefreshing(true);
  //   fetchBanners().finally(() => setTimeout(() => setIsRefreshing(false), 1000));
  // }, [fetchBanners]);

  if (loading) {
    return <div className="text-center p-4">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Ошибка: {error}</div>;
  }

  if (!banners.length) {
    return <div className="text-center p-4">Баннеры не найдены</div>;
  }

  return (
    <motion.div className="w-full bg-base-100 min-h-screen p-4 rounded-lg">
      <motion.div className='flex justify-between my-4' initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <h2 className='text-2xl'>Banner</h2>
        <motion.div className='w-full flex justify-end my-2 gap-4'>
          <motion.button
            className="btn btn-primary btn-sm flex items-center gap-2 text-end"
            onClick={openAddModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus className="w-4 h-4" /> Add Product
          </motion.button>
          <motion.button
            className="btn btn-outline btn-sm flex items-center gap-2"
            // onClick={handleRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCcw className={isRefreshing ? "animate-spin w-4 h-4" : "w-4 h-4"} /> Yangilash
          </motion.button>
        </motion.div>
      </motion.div>
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
                  <span className="label-text">Rasm</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => setModalState((prev) => ({ ...prev, newImage: e.target.files[0] }))}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Url kiriting: </span>
                </label>
                <input
                  type="url"
                  placeholder="Url kiriting"
                  className="input input-bordered w-full"
                  value={modalState.newUrl}
                  onChange={(e) => setModalState((prev) => ({ ...prev, newUrl: e.target.value }))}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Banner nomini kiriting: </span>
                </label>
                <input
                  type="text"
                  placeholder="Banner nomini kiriting"
                  className="input input-bordered w-full"
                  value={modalState.newTitle}
                  onChange={(e) => setModalState((prev) => ({ ...prev, newTitle: e.target.value }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Banner malumotlari: </span>
                </label>
                <input
                  type="text"
                  placeholder="Banner malumotlari"
                  className="input input-bordered w-full"
                  value={modalState.newName}
                  onChange={(e) => setModalState((prev) => ({ ...prev, newDescription: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-action mt-6 flex justify-end gap-3">
              <motion.button
                className="btn btn-primary btn-sm"
                onClick={handleAddBanner}
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
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        spaceBetween={10} // Уменьшено для экономии пространства
        slidesPerView={1} // По умолчанию 1 слайд
        scrollbar={{ draggable: true }}
        autoplay={
          banners.length > 1
            ? { delay: 3000, disableOnInteraction: false }
            : false
        }
        pagination={{ clickable: true }}
        navigation={banners.length > 1}
        className="mySwiper w-full rounded-xl shadow-md"
      >
        {banners.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={item.banner || '/fallback.jpg'}
                alt={item.title || 'Баннер'}
                className="w-full h-60 object-cover rounded-t-xl"
              />
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2 line-clamp-2">
                  {item.title || 'Без названия'}
                </h2>
                <p className="text-gray-700 line-clamp-3">
                  {item.description || 'Описание отсутствует'}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <motion.ul className='grid grid-cols-2 gap-4 w-full mt-20'>
        {
          banners.map((banner) => (
            <li className='flex w-full rounded-2xl shadow-md border-1 border-solid border-gray-300 p-4 my-3 items-center justify-between gap-3'>
              <img src={banner.banner || banner.url} alt="" className='w-2/5 h-30 object-cover' />
              <span className='w-2/5'>
                <h4>Title: {banner.title || "Без названия"}</h4>
                <p>Description: {banner.description || "Без описания"}</p>
              </span>
              <motion.button
                className="btn btn-error btn-sm text-base-100 w-1/5"
                onClick={() => deleteBanner(banner.id)} // 4 = Returned
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTrash2 /> Delete
              </motion.button>
            </li>
          ))
        }
      </motion.ul>
    </motion.div>
  );
};


export default Banner;