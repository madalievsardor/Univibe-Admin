import React, { useState, useEffect } from "react";
import { MdImage } from "react-icons/md";
import { motion } from "framer-motion";

const ImagesSection = ({ register, errors, setValue, watch, onImagesChange }) => {
  const [imagePreviews, setImagePreviews] = useState([]);
  const images = watch("images") || [];

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      alert("Каждое изображение должно быть меньше 5MB");
      return;
    }

    if (files.length > 0) {
      const limitedFiles = files.slice(0, 5 - images.length);
      setImagePreviews([...imagePreviews, ...limitedFiles.map((file) => URL.createObjectURL(file))]);
      setValue("images", [...images, ...limitedFiles], { shouldValidate: true });
      if (onImagesChange) onImagesChange(e);
    }
  };

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const previewVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-2 mb-2">
          <MdImage className="text-lg text-base-content" />
          <span className="label-text text-base-content font-medium">Галерея изображений (макс. 5)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          className="file-input file-input-bordered w-full bg-base-100 focus:file-input-primary"
        />
        <input
          type="hidden"
          {...register("images", {
            required: "Галерея изображений обязательна",
            validate: (value) => value.length <= 5 || "Максимум 5 изображений",
          })}
        />
        {errors.images && <p className="text-error text-sm mt-1">{errors.images.message}</p>}
        {imagePreviews.length > 0 && (
          <motion.div className="mt-4 flex flex-wrap gap-4" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            {imagePreviews.map((preview, index) => (
              <motion.div key={index} variants={previewVariants} className="relative">
                <img src={preview} alt={`Preview ${index + 1}`} className="w-24 h-24 object-cover rounded-lg shadow-md" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ImagesSection;