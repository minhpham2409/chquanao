import React, { useState, useContext } from 'react';
import './AddPopUp.css';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';

const AddPopUp = ({ id, name, price, description, image, setShowPopup, sizes = [] }) => {
  const { cartItems, addToCart } = useContext(StoreContext);
  
  const initialSize = (sizes && sizes.length === 1 && sizes[0].size === 'One Size') ? 'One Size' : null;
  const [selectedSize, setSelectedSize] = useState(initialSize);

  const handleAdd = () => {
    if (sizes && sizes.length > 1 && !selectedSize) {
      alert("Vui lòng chọn size!");
      return;
    }
    
    const sizeToAdd = selectedSize || 'One Size';
    const itemKey = `${id}-${sizeToAdd}`;
    const currentCartQuantity = cartItems[itemKey] || 0;

    let stockQuantity = Infinity;
    if (sizes && sizes.length > 0) {
      const sizeInfo = sizes.find(s => s.size === sizeToAdd);
      if (sizeInfo) {
        stockQuantity = sizeInfo.quantity;
      } else if (sizeToAdd !== 'One Size') {
        console.error(`Size info not found for selected size: ${sizeToAdd}`);
        alert("Lỗi: Không tìm thấy thông tin cho size đã chọn.");
        return;
      }
    }

    if (currentCartQuantity >= stockQuantity) {
      alert(`Số lượng sản phẩm ${name} (Size: ${sizeToAdd}) trong giỏ đã đạt tối đa (${stockQuantity}).`);
      return;
    }

    addToCart(id, sizeToAdd);
    setShowPopup(false);
  };

  const isAddDisabled = sizes && sizes.length > 1 && !selectedSize;
  const hasMultipleSizes = sizes && sizes.length > 1;

  return (
    <div className="popup-overlay" onClick={() => setShowPopup(false)}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-popup-btn" onClick={() => setShowPopup(false)}>X</button>
        <div className="popup-content">
          <img src={assets[image] || assets.placeholder} alt={name} className="popup-img" />
          <h3>{name}</h3>
          <p className="popup-price">${price}</p>
          <p>{description}</p>

          {hasMultipleSizes && (
            <div className="size-selection-popup">
              <p>Chọn Size:</p>
              <div className="size-options-popup">
                {sizes.map(({ size, quantity }) => {
                  const isOutOfStock = quantity === 0;
                  const itemKey = `${id}-${size}`;
                  const currentCartQuantity = cartItems[itemKey] || 0;
                  const isDisabled = isOutOfStock || currentCartQuantity >= quantity;

                  return (
                    <button
                      key={size}
                      className={`size-option-popup ${selectedSize === size ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && setSelectedSize(size)}
                      disabled={isDisabled}
                      title={isOutOfStock ? 'Hết hàng' : isDisabled ? `Đã có ${quantity} trong giỏ` : `Còn lại: ${quantity - currentCartQuantity}`}
                    >
                      {size} ({quantity - currentCartQuantity > 0 ? quantity - currentCartQuantity : 0} còn lại)
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="popup-actions">
            <button 
              className="add-to-cart-popup-btn" 
              onClick={handleAdd}
              disabled={isAddDisabled}
            >
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPopUp;
