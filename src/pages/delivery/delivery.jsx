import React, { useEffect, useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';

const Delivery = () => {
  const [orders, setOrders] = useState([]);
  const { currentUser } = useContext(StoreContext);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      const res = await fetch('http://localhost:3001/orders');
      const data = await res.json();

      
      const userOrders = data.filter(order => order.userId === currentUser.id);
      setOrders(userOrders);
    };

    fetchData();
  }, [currentUser]);

  const handleMarkAsDelivered = async (orderId) => {
    const confirmDelete = window.confirm("Xác nhận đơn hàng đã giao và muốn xóa?");
    if (!confirmDelete) return;

    const res = await fetch(`http://localhost:3001/orders/${orderId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      alert("✅ Đơn hàng đã được xác nhận là giao thành công!");
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } else {
      alert(" Lỗi khi xóa đơn hàng!");
    }
  };

  if (!currentUser) {
    return (
      <div className='delivery-container'>
        <h2>Vui lòng đăng nhập để xem đơn hàng của bạn.</h2>
      </div>
    );
  }

  return (
    <div className='delivery-container'>
      <h2>Đơn hàng của bạn</h2>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Món & số lượng</th>
              <th>Thông tin giao hàng</th>
              <th>Tổng tiền</th>
              <th>Thời gian</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  <ul>
                    {Object.entries(order.items).map(([itemId, qty]) => (
                      <li key={itemId}>Món {itemId}: {qty}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  {order.shipping.rname}<br />
                  {order.shipping.street}, {order.shipping.city}, {order.shipping.state}<br />
                  SĐT: {order.shipping.phone}<br />
                  Ghi chú: {order.shipping.note}
                </td>
                <td>{order.total}₫</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <button
                    className="delivered-btn"
                    onClick={() => handleMarkAsDelivered(order.id)}
                  >
                    Đã giao hàng
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Delivery;
