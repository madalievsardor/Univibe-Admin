import React from 'react';
import PropTypes from 'prop-types';

// Компонент CustomBtn
const CustomBtn = ({ 
  text, 
  type = 'button', 
  method = 'post', 
  onClick, 
  disabled = false, 
  className = '', 
}) => {
  // Определение стилей в зависимости от метода запроса
  const getButtonStyles = () => {
    switch (method.toLowerCase()) {
      case 'put':
        return `btn-warning`;
      case 'delete':
        return `btn-error`;
      case 'post':
      default:
        return `bg-info-500`;
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${getButtonStyles()} ${className} ${disabled ? 'btn-disabled' : ''}`}
    >
      {text}
    </button>
  );
};

// Пропсы и их типы
CustomBtn.propTypes = {
  text: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  method: PropTypes.oneOf(['post', 'put', 'delete']),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'ghost', 'link']),
};

export default CustomBtn;