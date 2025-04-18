import React, { useState } from 'react';
import './AddPopUp.css';
import { useStore } from '../../context/StoreContext';

const AddPopUp = ({ id, name, price, description, image, setShowPopup, sizes = [] }) => {
  const { addToCart } = useStore();
  const [selectedSize, setSelectedSize] = useState('');

  const handleAdd = () => {
    if (sizes && sizes.length > 0 && !selectedSize) {
      alert("Vui lòng chọn size!");
      return;
    }
    addToCart(id, selectedSize);
    setShowPopup(false);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-content">
          <img src={image} alt="" className="popup-img" />
          <h3>{name}</h3>
          <p className="popup-price">${price}</p>
          <p>{description}</p>

          {sizes && sizes.length > 0 && (
            <div className="size">
              {sizes.map((sizeInfo) => (
                <button
                  key={sizeInfo.size}
                  className={`${selectedSize === sizeInfo.size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(sizeInfo.size)}
                  disabled={sizeInfo.quantity === 0}
                >
                  {sizeInfo.size}
                </button>
              ))}
            </div>
          )}
          
          <div className="quantity-control">
            <button onClick={() => setShowPopup(false)}>Hủy</button>
            <button className="add-to-cart-button" onClick={handleAdd}>
              Thêm vào giỏ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPopUp;
