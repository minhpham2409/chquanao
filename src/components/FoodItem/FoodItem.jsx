import React, { useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { useStore } from '../../context/StoreContext';
import AddPopUp from '../AddPopUp/AddPopUp';

const FoodItem = ({ id, name, price, description, image, sizes = [] }) => {
  const { currentUser } = useStore();
  const [showPopup, setShowPopup] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("Bạn cần đăng nhập để thêm sản phẩm vào giỏ!");
      return;
    }
    setShowPopup(true);
  };

  return (
    <>
      <div className="food-item">
        <div className="food-item-img-container">
          <img className='food-item-img' src={image} alt="" />
        </div>

        <div className="food-item-info">
          <div className="food-item-rating">
            <p>{name}</p>
            {/* <img src={assets.rating_starts} alt="" /> */}
          </div>
          <p className="food-item-desc">{description}</p>
          <p className="food-item-price">${price}</p>
          
          <button 
            className="add-to-cart-btn" 
            onClick={handleAdd}
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>

      {showPopup && (
        <AddPopUp 
          id={id}
          name={name}
          price={price}
          description={description}
          image={image}
          sizes={sizes}
          setShowPopup={setShowPopup}  
        />
      )}
    </>
  );
};

export default FoodItem;
