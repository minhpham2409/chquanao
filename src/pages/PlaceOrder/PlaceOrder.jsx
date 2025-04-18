import React, { useContext, useState, useEffect } from 'react';
import "./PlaceOrder.css";
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotal, currentUser, setCurrentUser, setCartItems, cartItems } = useContext(StoreContext);
  const [rname, setRname] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [useLastAddress, setUseLastAddress] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUseLastAddress(currentUser?.rname ? true : false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (useLastAddress && currentUser?.rname) {
      setRname(currentUser.rname);
      setStreet(currentUser.street);
      setCity(currentUser.city);
      setState(currentUser.state);
      setPhone(currentUser.phone);
      setNote(currentUser.note || '');
    } else {
      setRname('');
      setStreet('');
      setCity('');
      setState('');
      setPhone('');
      setNote('');
    }
  }, [useLastAddress, currentUser]);

  if (!currentUser) {
    return (
      <div className="place-order">
        <h2>Vui lòng đăng nhập để đặt hàng.</h2>
      </div>
    );
  }

  const handleInformation = async (e) => {
    e.preventDefault();
    if (!useLastAddress && (phone.length < 10 || phone[0] !== '0')) {
      return alert('Please enter valid phone number');
    }

    let updatedUser = { ...currentUser };

    if (!useLastAddress) {
      const res = await fetch(`http://localhost:3001/users/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rname,
          street,
          city,
          state,
          phone,
          note
        })
      });

      if (!res.ok) {
        return alert("❌ Đặt hàng thất bại.");
      }

      updatedUser = {
        ...updatedUser,
        rname,
        street,
        city,
        state,
        phone,
        note
      };
    }

    const orderData = {
      userId: currentUser.id,
      items: cartItems,
      total: getTotal() + 2,
      shipping: {
        rname: updatedUser.rname,
        street: updatedUser.street,
        city: updatedUser.city,
        state: updatedUser.state,
        phone: updatedUser.phone,
        note: updatedUser.note
      },
      createdAt: new Date().toISOString()
    };

    const orderRes = await fetch("http://localhost:3001/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    if (!orderRes.ok) {
      return alert("❌ Không thể lưu đơn hàng.");
    }

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setCartItems({});
    alert("✅ Đặt hàng thành công!");
    navigate("/delivery");
  };

  return (
    <div>
      <form className='place-order' onSubmit={handleInformation}>
        <div className='place-order-left'>
          <p className='title'>Delivery information</p>

          {currentUser.rname && (
            <div className="address-selection">
              <p>Choose your delivery address:</p>
              <label>
                <input type="radio" name="address" value="last" checked={useLastAddress} onChange={() => setUseLastAddress(true)} />
                Use last delivery address
              </label>
              <label>
                <input type="radio" name="address" value="new" checked={!useLastAddress} onChange={() => setUseLastAddress(false)} />
                Enter new delivery address
              </label>
            </div>
          )}

          {(!useLastAddress || !currentUser.rname) && (
            <>
              <div className="mutil-fields">
                <input type="text" placeholder='Recipient Name' value={rname} onChange={(e) => setRname(e.target.value)} required />
              </div>
              <input type="text" placeholder='Street' value={street} onChange={(e) => setStreet(e.target.value)} required />
              <div className="mutil-fields">
                <input type="text" placeholder='City' value={city} onChange={(e) => setCity(e.target.value)} required />
                <input type="text" placeholder='State' value={state} onChange={(e) => setState(e.target.value)} required />
              </div>
              <input type="text" placeholder='Phone' value={phone} onChange={(e) => setPhone(e.target.value)} required />
              {(phone.length < 10 || phone[0] !== '0') && phone.length > 0 && (
                <p>Please enter valid phone number</p>
              )}
              <textarea placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
            </>
          )}
        </div>

        <div className="place-order-right">
          <div className="cart-total">
            <h2>Cart totals</h2>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>{getTotal()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery fee</p>
              <p>{2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>{getTotal() + 2}</b>
            </div>
            <button type="submit">PROCEED TO PAYMENT</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
