import React, { useState, useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import AddPopUp from '../AddPopUp/AddPopUp';

const FoodItem = ({ id, name, price, description, image, sizes }) => {
  const { currentUser } = useContext(StoreContext);
  const [showPopup, setShowPopup] = useState(false);

  const handleAddButtonClick = (e) => {
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
          <img className='food-item-img' src={assets[image] || assets.placeholder} alt={name} />
        </div>

        <div className="food-item-info">
          <div className="food-item-rating">
            <p>{name}</p>
          </div>
          <p className="food-item-desc">{description}</p>
          <p className="food-item-price">${price}</p>
          
          <button 
            className="add-to-cart-btn" 
            onClick={handleAddButtonClick}
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
