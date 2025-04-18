import React, { useState, useEffect } from 'react';
import './OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, dishesResponse, usersResponse] = await Promise.all([
          fetch('http://localhost:3001/orders'),
          fetch('http://localhost:3001/dishes'),
          fetch('http://localhost:3001/users')
        ]);

        if (!ordersResponse.ok || !dishesResponse.ok || !usersResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const ordersData = await ordersResponse.json();
        const dishesData = await dishesResponse.json();
        const usersData = await usersResponse.json();

        setOrders(ordersData);
        setDishes(dishesData);
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getDishName = (dishId) => {
    if (!dishes || !Array.isArray(dishes)) return 'Unknown Dish';
    const dish = dishes.find(d => String(d.id) === String(dishId));
    return dish ? dish.name : 'Unknown Dish';
  };

  const getUserName = (userId) => {
    if (!userId) return 'Khách vãng lai';
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Khách vãng lai';
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="order-management">
      <h2>Quản lý đơn hàng</h2>
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Người đặt</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Thông tin giao hàng</th>
              <th>Ngày đặt</th>
            </tr>
          </thead>
          <tbody>
            {orders && orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{getUserName(order.userId)}</td>
                <td>
                  <ul>
                    {order.items && Object.entries(order.items).map(([itemKey, quantity]) => {
                      const [dishId, size] = itemKey.split('-');
                      return (
                        <li key={itemKey}>
                          {getDishName(dishId)} - Size: {size || 'Default'} x {quantity}
                        </li>
                      );
                    })}
                  </ul>
                </td>
                <td>{formatCurrency(order.total)}</td>
                <td>
                  <div className="shipping-info">
                    <p><strong>Tên:</strong> {order.shipping?.rname}</p>
                    <p><strong>Địa chỉ:</strong> {order.shipping?.street}, {order.shipping?.city}, {order.shipping?.state}</p>
                    <p><strong>SĐT:</strong> {order.shipping?.phone}</p>
                    {order.shipping?.note && <p><strong>Ghi chú:</strong> {order.shipping.note}</p>}
                  </div>
                </td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement; 