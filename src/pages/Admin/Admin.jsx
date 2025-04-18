import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { Form, useNavigate } from 'react-router-dom';
import './Admin.css';
import OrderManagement from './OrderManagement';


const Admin = () => {
  const {
    isAdmin, setAdmin, dishes,
    editDishId, setEditDishId,
    editedDish, setEditedDish,
    updateDish, fetchDish
  } = useContext(StoreContext);
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState(null);
  const [users, setUsers] = useState([]);
  const [add,isAdd] = useState(false)
  const [name,setName] = useState('')
  const [price,setPrice] =useState(0)
  const [image,setImage] =useState('')
  const [description,setDescription] =useState('')
  const [category,setCategory] =useState('')
  const [id,setId] =useState('')

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:3001/users");
    const data = await res.json();
    setUsers(data);
  };

  const handleDelete = async (id, role) => {
    if (role === "Admin") {
      alert("❌ Không thể xóa tài khoản Admin.");
      return;
    }
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa người dùng này không?");
    if (!confirmDelete) return;

    const res = await fetch(`http://localhost:3001/users/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("✅ Xóa người dùng thành công.");
      fetchUsers();
    } else {
      alert("❌ Xóa người dùng thất bại.");
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      try {
        // 1. Xóa món ăn
        const response = await fetch(`http://localhost:3001/dishes/${dishId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete dish');
        }

        // 2. Lấy tất cả món có ID lớn hơn món bị xóa
        const dishesToUpdate = dishes
          .filter(dish => Number(dish.id) > Number(dishId))
          .sort((a, b) => Number(a.id) - Number(b.id));

        // 3. Cập nhật ID của các món này giảm đi 1
        const updatePromises = dishesToUpdate.map(dish => {
          const newId = (Number(dish.id) - 1).toString();
          return fetch(`http://localhost:3001/dishes/${dish.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...dish,
              id: newId
            })
          });
        });

        await Promise.all(updatePromises);
        await fetchDish();
        alert('Xóa món ăn thành công!');
      } catch (error) {
        console.error('Error deleting dish:', error);
        alert('Có lỗi xảy ra khi xóa món ăn');
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo tên file duy nhất
      const fileName = `food_${Date.now()}.${file.name.split('.').pop()}`;
      
      // Lưu tên file vào state
      setImage(fileName);
      
      // Tạo URL tạm thời để hiển thị ảnh
      const imageUrl = URL.createObjectURL(file);
      
      // Hiển thị ảnh xem trước
      const preview = document.createElement('img');
      preview.src = imageUrl;
      preview.style.maxWidth = '200px';
      preview.style.maxHeight = '200px';
      
      // Thêm ảnh xem trước vào form
      const previewContainer = document.querySelector('.image-preview');
      if (previewContainer) {
        previewContainer.innerHTML = '';
        previewContainer.appendChild(preview);
      }
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
  
    const validIds = dishes
      .map(d => Number(d.id))
      .filter(id => !isNaN(id));  
  
    const maxId = validIds.length > 0 ? Math.max(...validIds) : 0;
    const newId = String(maxId + 1);
    
    // Tạo form data để gửi cả file ảnh và dữ liệu
    const formData = new FormData();
    formData.append('id', newId);
    formData.append('name', name);
    formData.append('price', price);
    formData.append('image', image);
    formData.append('description', description);
    formData.append('category', category);
    
    const res = await fetch("http://localhost:3001/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newId,
        name,
        price: Number(price),
        image: image,
        description,
        category
      })
    });
    
    if (res.ok) {
      // Copy file ảnh vào thư mục public/images
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            
            // Tạo link tải xuống để lưu ảnh
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = image;
            link.click();
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
      
      await fetchDish(); 
      alert("✅ Thêm món ăn thành công!");
      setName('');
      setPrice(0);
      setImage('');
      setDescription('');
      setCategory('');
      isAdd(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className='admin-container'>
      <div className='function-choice'>
        <h2>Admin Dashboard</h2>
        <ul className='choice'>
          <li><button onClick={() => { setSelectedSection("users"); fetchUsers(); }}>User Management</button></li>
          <li><button onClick={() => { navigate("/") }}>Buy food</button></li>
          <li><button onClick={() => setSelectedSection("admin")}>Set new admin</button></li>
          <li><button onClick={() => setSelectedSection("food")}>Food Management</button></li>
          <li><button onClick={() => setSelectedSection("orders")}>Order Management</button></li>
        </ul>
      </div>

      <div className='admin-content'>
        {selectedSection === "orders" && <OrderManagement />}
        {selectedSection === "users" && (
          <div className="admin-section">
            <h3>Danh sách người dùng</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td><button className="delete-btn" onClick={() => handleDelete(user.id, user.role)}>X</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {selectedSection === "food" && (
          <div className="admin-section">
            <h3>Danh sách món ăn</h3>
            <button onClick={()=>isAdd(!add)}>Thêm món ăn</button>
            {add===true?
            <form onSubmit={handleAdd}>
              <input 
                type="text" 
                placeholder='Tên món' 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                required
              />
              <div className="image-preview"></div>
              <input 
                type="number" 
                placeholder="Giá" 
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
              <input 
                type="text" 
                placeholder='Mô tả'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <input 
                type="text" 
                placeholder='Danh mục'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
              <button type='submit'>Thêm</button>
            </form>:<></>}
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên món</th>
                  <th>Giá</th>
                  <th>Hình ảnh</th>
                  <th>quantity</th>
                  <th>Chỉnh sửa món ăn</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((food) => (
                  <tr key={food.id}>
                    <td>{food.id}</td>
                    <td>{editDishId === food.id ? (
                      <input
                        value={editedDish.name}
                        onChange={(e) => setEditedDish({ ...editedDish, name: e.target.value })}
                      />
                    ) : (
                      food.name
                    )}</td>
                    <td>{editDishId === food.id ? (
                      <input
                        type="number"
                        value={editedDish.price}
                        onChange={(e) => setEditedDish({ ...editedDish, price: parseFloat(e.target.value) })}
                      />
                    ) : (
                      food.price
                    )}</td>
                    <td><img src={food.image} alt={food.name} height="40" /></td>
                    {food.sizes.map((size)=>(
                      <div><td>{size.size}</td>
                      <td>{size.quantity}</td></div>
                      
                      
                    ))}
                    <td>
                      {editDishId === food.id ? (
                        <button onClick={() => updateDish(food.id)}>Lưu</button>
                      ) : (
                        <>
                          <button onClick={() => {
                            setEditDishId(food.id);
                            setEditedDish({
                              name: food.name,
                              price: food.price,
                              image: food.image,
                              description: food.description,
                              category: food.category
                            });
                          }}>Sửa</button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteDish(food.id)}
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedSection === "order" && (
          <div className="admin-section">
            <h3>Danh sách đơn hàng </h3>
            {users.map((user) => (
              <div key={user.id} className="order-block">
                <h4>Người đặt: {user.name}</h4>
                {user.cartItems && Object.keys(user.cartItems).length > 0 ? (
                  <ul>
                    {Object.entries(user.cartItems).map(([itemId, quantity]) => {
                      const item = dishes.find(f => Number(f.id) === Number(itemId));
                      return (
                        <li key={itemId}>{item?.name || 'Unknown'} - SL: {quantity}</li>
                      );
                    })}
                  </ul>
                ) : (
                  <p>Không có đơn hàng nào.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
