import React from 'react';
import { MdCategory, MdApps } from 'react-icons/md';

const AdditionalInfoSection = ({ register, errors, otherProducts }) => (
  <div className="space-y-4">
    <div>
      <label className="flex items-center gap-2">
        <MdCategory className="text-lg" />
        <span className="label-text text-base-content">Вид продукта</span>
      </label>
      <input
        {...register('type')}
        type="text"
        placeholder="e.g., Шовная"
        className="input input-bordered w-full"
      />
    </div>

    <div>
      <label className="flex items-center gap-2">
        <MdApps className="text-lg" />
        <span className="label-text text-base-content">Другие продукты</span>
      </label>
      <select
        {...register('others')}
        multiple
        className="select select-bordered w-full h-32"
      >
        <option value="" disabled>Выберите другие продукты</option>
        {otherProducts.map((product) => (
          <option key={product._id} value={product._id}>
            {product.title}
          </option>
        ))}
      </select>
      {errors.others && <p className="text-error text-sm mt-1">{errors.others.message}</p>}
    </div>
  </div>
);

export default AdditionalInfoSection;