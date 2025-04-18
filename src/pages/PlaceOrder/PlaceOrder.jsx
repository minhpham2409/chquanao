import React, { useContext, useState, useEffect } from 'react';
import "./PlaceOrder.css";
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { getTotal, currentUser, setCurrentUser, setCartItems, cartItems, dishes } = useContext(StoreContext);
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
    let currentShippingInfo = {};

    if (!useLastAddress) {
      const updatedFields = {
        rname,
        street,
        city,
        state,
        phone,
        note
      };
      try {
        const res = await fetch(`http://localhost:3001/users/${currentUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields)
        });

        if (!res.ok) {
          throw new Error('Failed to update user address');
        }
        updatedUser = { ...updatedUser, ...updatedFields };
        currentShippingInfo = updatedFields;
      } catch (error) {
        console.error("Error updating user address:", error);
        alert("❌ Lỗi khi cập nhật địa chỉ. Vui lòng thử lại.");
        return;
      }
    } else {
      currentShippingInfo = {
        rname: currentUser.rname,
        street: currentUser.street,
        city: currentUser.city,
        state: currentUser.state,
        phone: currentUser.phone,
        note: currentUser.note
      };
    }
    
    const orderData = {
      userId: currentUser.id,
      items: cartItems,
      total: getTotal() + 2,
      shipping: currentShippingInfo,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Đặt hàng
      const orderRes = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (!orderRes.ok) {
        throw new Error('Failed to save order');
      }

      // 2. Cập nhật số lượng trong kho
      try {
        // Lấy danh sách sản phẩm mới nhất
        const dishesRes = await fetch('http://localhost:3001/dishes');
        const currentDishes = await dishesRes.json();
        
        // Lưu các sản phẩm cần cập nhật
        const dishesToUpdate = [];

        // Xử lý từng sản phẩm trong giỏ hàng
        for (const [itemKey, quantity] of Object.entries(cartItems)) {
          if (quantity <= 0) continue; // Bỏ qua nếu số lượng là 0 hoặc âm

          const [dishId, size] = itemKey.split('-');
          const dish = currentDishes.find(d => d.id.toString() === dishId);
          
          if (dish && dish.sizes && Array.isArray(dish.sizes)) {
            // Tìm size tương ứng và cập nhật số lượng
            const sizeIndex = dish.sizes.findIndex(s => s.size === size);
            if (sizeIndex !== -1) {
              // Tạo bản sao của dish để tránh thay đổi trực tiếp currentDishes
              const updatedDish = JSON.parse(JSON.stringify(dish)); 

              // Tính toán số lượng mới
              const currentQuantity = updatedDish.sizes[sizeIndex].quantity;
              const newQuantity = Math.max(0, currentQuantity - quantity);
              updatedDish.sizes[sizeIndex].quantity = newQuantity;
              
              console.log(`Cập nhật số lượng cho ${updatedDish.name} (Size ${size}):`, {
                cũ: currentQuantity,
                đãMua: quantity,
                cònLại: newQuantity
              });

              // Chỉ thêm vào danh sách nếu thực sự có thay đổi số lượng
              if(newQuantity !== currentQuantity) {
                  // Kiểm tra xem dish này đã có trong dishesToUpdate chưa
                  const existingUpdateIndex = dishesToUpdate.findIndex(item => item.id.toString() === dishId);
                  if (existingUpdateIndex !== -1) {
                      // Nếu đã có, cập nhật lại data
                      dishesToUpdate[existingUpdateIndex].data = updatedDish;
                  } else {
                      // Nếu chưa có, thêm mới
                      dishesToUpdate.push({
                        id: updatedDish.id,
                        data: updatedDish // Sử dụng bản sao đã cập nhật
                      });
                  }
              }
            } else {
               console.warn(`Size '${size}' không tìm thấy cho sản phẩm ID '${dishId}' trong quá trình cập nhật kho.`);
            }
          } else {
             console.warn(`Sản phẩm ID '${dishId}' không tìm thấy hoặc không có thông tin sizes.`);
          }
        }

        // Thực hiện cập nhật song song cho tất cả sản phẩm cần thay đổi
        if (dishesToUpdate.length > 0) {
            const updatePromises = dishesToUpdate.map(({ id, data }) => {
               console.log(`Chuẩn bị gửi PUT request cho /dishes/${id} với data:`, JSON.stringify(data, null, 2));
               return fetch(`http://localhost:3001/dishes/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
               });
            });

            const updateResults = await Promise.all(updatePromises);

            // Kiểm tra kết quả cập nhật
            const failedUpdates = updateResults.filter(res => !res.ok);
            if (failedUpdates.length > 0) {
                console.error(`${failedUpdates.length} sản phẩm cập nhật thất bại`);
                // Có thể thêm log chi tiết hơn về các request thất bại nếu cần
                alert('Đặt hàng thành công nhưng có lỗi khi cập nhật số lượng tồn kho. Một số sản phẩm có thể chưa được cập nhật.');
            } else {
                console.log('Tất cả sản phẩm đã được cập nhật số lượng thành công.');
            }
        } else {
            console.log('Không có sản phẩm nào cần cập nhật số lượng.');
        }

      } catch (stockError) {
        console.error("Lỗi cập nhật số lượng:", stockError);
        // Thông báo lỗi cụ thể hơn nếu có thể, nhưng vẫn giữ thông báo chung
        alert("Đặt hàng thành công nhưng đã xảy ra lỗi trong quá trình cập nhật số lượng tồn kho. Vui lòng kiểm tra console để biết chi tiết.");
      }

      // 3. Hoàn tất đơn hàng
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setCartItems({});
      alert("✅ Đặt hàng thành công!");
      navigate("/delivery");

    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      // Phân biệt lỗi lưu đơn hàng và lỗi khác nếu có thể
      const alertMessage = error.message === 'Failed to save order' 
        ? '❌ Không thể lưu đơn hàng. Vui lòng thử lại.' 
        : '❌ Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      alert(alertMessage);
    }
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
