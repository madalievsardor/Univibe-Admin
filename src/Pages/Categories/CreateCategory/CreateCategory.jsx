import React, { useState, useEffect } from 'react';
import useFetch from '../../../hooks/useFetch';
import { toast } from 'react-toastify';

const CreateCategory = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'https://default-api.com';
    const token = localStorage.getItem('token');
    const [formData, setFormData] = useState({
        name: '',
        image: null,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const { data, error, loading, postData } = useFetch();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!apiUrl) {
            console.error('REACT_APP_API_URL is not defined in the environment.');
            return;
        }

        const submitData = new FormData();
        submitData.append('name', formData.name);
        if (formData.image) {
            submitData.append('image', formData.image);
        }

        try {
            await postData(`${apiUrl}/api/v1/categories`, submitData, {
                Authorization: `Bearer ${token}`,
            });

            toast.success('Категория успешно создана!');
            setFormData({ name: '', image: null });
            setPreviewImage(null);
        } catch (err) {
            console.error('Ошибка при создании категории:', err, {
                url: `${apiUrl}/api/v1 Categories`,
                response: err.message,
            });
        }
    };

    return (
        <div className="container mx-auto p-6 bg-base-100 shadow-lg rounded-box max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-base-content">Создать новую категорию</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                    <label htmlFor="name" className="label">
                        <span className="label-text">Название категории</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="input input-bordered input-md w-full transition-all duration-200 hover:border-primary"
                        placeholder="Введите название категории"
                    />
                </div>

                <div className="form-control">
                    <label htmlFor="image" className="label">
                        <span className="label-text">Изображение категории</span>
                    </label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input file-input-bordered file-input-md w-full transition-all duration-200 hover:border-primary"
                    />
                    {previewImage && (
                        <div className="mt-3">
                            <img
                                src={previewImage}
                                alt="Предпросмотр"
                                className="w-32 h-32 object-cover rounded-box border border-base-200"
                            />
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-error text-sm mt-2 p-2 bg-error bg-opacity-10 rounded">
                        {error.includes('404')
                            ? 'API endpoint не найден. Проверьте конфигурацию сервера.'
                            : error}
                    </p>
                )}

                <button
                    type="submit"
                    className={`btn btn-primary btn-md w-full transition-all duration-200 ${loading ? 'btn-disabled' : 'hover:bg-primary-focus'}`}
                >
                    {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                        'Создать категорию'
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreateCategory;