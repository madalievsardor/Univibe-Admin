import React from 'react';
import { MdStraighten, MdThermostat, MdBuild, MdNumbers, MdCategory } from 'react-icons/md';

const TechnicalSpecsSection = ({ register, errors }) => (
  <div className="space-y-4">
    <div>
      <label className="flex items-center gap-2">
        <MdStraighten className="text-lg" />
        <span className="label-text text-base-content">Размер</span>
      </label>
      <input
        {...register('size', { required: 'Размер обязателен' })}
        type="text"
        placeholder="e.g., 1/2"
        className="input input-bordered w-full"
      />
      {errors.size && <p className="text-error text-sm mt-1">{errors.size.message}</p>}
    </div>

    <div>
      <label className="flex items-center gap-2">
        <MdBuild className="text-lg" />
        <span className="label-text text-base-content">Материал</span>
      </label>
      <input
        {...register('material')}
        type="text"
        className="input input-bordered w-full"
      />
    </div>

    <div>
      <label className="flex items-center gap-2">
        <MdThermostat className="text-lg" />
        <span className="label-text text-base-content">Максимальная температура</span>
      </label>
      <input
        {...register('maxTemperature')}
        type="text"
        placeholder="e.g., 120°C"
        className="input input-bordered w-full"
      />
    </div>

    <div>
      <label className="flex items-center gap-2">
        <MdNumbers className="text-lg" />
        <span className="label-text text-base-content">Давление</span>
      </label>
      <input
        {...register('pressure', { 
          required: 'Давление обязательно',
          valueAsNumber: true,
          min: { value: 0, message: 'Давление не может быть отрицательным' }
        })}
        type="number"
        step="0.1"
        className="input input-bordered w-full"
      />
      {errors.pressure && <p className="text-error text-sm mt-1">{errors.pressure.message}</p>}
    </div>

    <div>
      <label className="flex items-center gap-2">
        <MdCategory className="text-lg" />
        <span className="label-text text-base-content">Тип управления</span>
      </label>
      <input
        {...register('controlType')}
        type="text"
        placeholder="e.g., Ручное"
        className="input input-bordered w-full"
      />
    </div>

    <div>
      <label className="flex items-center gap-2">
        <MdNumbers className="text-lg" />
        <span className="label-text text-base-content">Вес</span>
      </label>
      <input
        {...register('weight')}
        type="text"
        placeholder="e.g., 5кг"
        className="input input-bordered w-full"
      />
    </div>
  </div>
);

export default TechnicalSpecsSection;