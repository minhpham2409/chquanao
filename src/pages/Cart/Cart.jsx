import React, { useContext } from 'react'
import './Cart.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const Cart = () => {
  const { cartItems, removeFromCart, getTotal, dishes } = useContext(StoreContext)
  const navigate = useNavigate();

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Item</p>
          <p>Title</p>
          <p>Size</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {Object.entries(cartItems).map(([itemKey, quantity]) => {
          const [itemId, size] = itemKey.split('-');
          const item = dishes.find(product => String(product.id) === itemId);
          
          if (item) {
            return (
              <div key={itemKey}>
                <div className='cart-items-title cart-items-item'>
                  <img src={item.image} alt="" />
                  <p>{item.name}</p>
                  <p>{size || 'N/A'}</p>
                  <p>${item.price}</p>
                  <p>{quantity}</p>
                  <p>${item.price * quantity}</p>
                  <p onClick={() => removeFromCart(itemId, size)} className='cross'>x</p>
                </div>
                <hr />
              </div>
            )
          }
          return null;
        })}
      </div>
      <hr className='bottom'/>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart totals</h2>
          <div className="cart-total-details">
            <p>Subtotal</p>
            <p>${getTotal()}</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <p>Delivery fee</p>
            <p>$2</p>
          </div>
          <hr />
          <div className="cart-total-details">
            <b>Total</b>
            <b>${getTotal() + 2}</b>
          </div>
          <button onClick={() => navigate('/order')}>PROCCESS TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have promocode, enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder='promocode' />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart