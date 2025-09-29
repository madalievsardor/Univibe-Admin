import React from 'react';
import { MdTitle, MdDescription, MdInventory, MdAttachMoney, MdCategory } from 'react-icons/md';

const BasicInfoSection = ({ register, errors, categories }) => (
  <div className="space-y-4">
    <div>
      <label className="flex items-center gap-2">
        <MdTitle className="text-lg" />
        <span className="label-text text-base-content">Название</span>
      </label>
      <input
        {...register('title', { required: 'Название обязательно' })}
        type="text"
        className="input input-bordered w-full"
      />
      {errors.title && <p className="text-error text-sm mt-1">{errors.title.message}</p>}
    </div>

    <div>
      <label className="flex items-center gap-2">
        <MdDescription className="text-lg" />
        <span className="label-text text-base-content">Описание</span>
      </label>
      <textarea
        {...register('description')}
        className="textarea textarea-bordered w-full"
      />
    </div>

    <div>
      <label className="flex items-center gap-2">
        <MdInventory className="text-lg" />
        <span className="label-text text-base-content">Количество</span>
      </label>
      <input
        {...register('stock', { 
          required: 'Количество обязательно',
          valueAsNumber: true,
          min: { value: 0, message: 'Количество не может быть отрицательным' }
        })}
        type="number"
        className="input input-bordered w-full"
      />
      {errors.stock && <p className="text-error text-sm mt-1">{errors.stock.message}</p>}
    </div>

    <div>
      <label className="flex items-center gap-2">
        <MdAttachMoney className="text-lg" />
        <span className="label-text text-base-content">Цена</span>
      </label>
      <input
        {...register('price', { 
          required: 'Цена обязательна',
          valueAsNumber: true,
          min: { value: 0, message: 'Цена не может быть отрицательной' }
        })}
        type="number"
        step="0.01"
        className="input input-bordered w-full"
      />
      {errors.price && <p className="text-error text-sm mt-1">{errors.price.message}</p>}
    </div>

    <div>
      <label className="flex items-center gap-2">
        <MdCategory className="text-lg" />
        <span className="label-text text-base-content">Категория</span>
      </label>
      <select
        {...register('category', { required: 'Категория обязательна' })}
        className="select select-bordered w-full"
      >
        <option value="">Выберите категорию</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select>
      {errors.category && <p className="text-error text-sm mt-1">{errors.category.message}</p>}
    </div>
  </div>
);

export default BasicInfoSection;