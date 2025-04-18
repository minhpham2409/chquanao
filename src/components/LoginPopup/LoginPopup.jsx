import React, { useContext, useState ,useEffect} from 'react';
import './LoginPopup.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Login");
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const {isAdmin,setAdmin} = useContext(StoreContext)
const navigate = useNavigate(); 
  const { setCurrentUser, setCartItems } = useContext(StoreContext);
   
    const HandleAdmin=()=>{
      
      navigate("/admin")
    }
  const handleAuth = async (e) => {
    e.preventDefault();

    if (!email || !password || (currState === "Sign Up" && !name)) {
      alert(" Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    
      
    
   
    

    if (currState === "Login") {
      const res = await fetch(`http://localhost:3001/users?email=${email}&password=${password}`);
      const data = await res.json();

      if (data.length > 0) {
        const user = data[0];
        localStorage.setItem("currentUser", JSON.stringify(user));
        setCurrentUser(user);
        setCartItems(user.cartItems || {});
        
        alert(`Chào mừng ${user.name}`);
        setShowLogin(false);
        if(data[0].role==="Admin"){
          HandleAdmin()
        }
      } else {
        alert("Email hoặc mật khẩu không đúng.");
      }
    } else {
      // Sign Up
      const check = await fetch(`http://localhost:3001/users?email=${email}`);
      const exists = await check.json();
      if (exists.length > 0) {
        alert("Email đã tồn tại.");
        return;
      }

      if (password.length < 6 || !agree) {
        if (password.length < 6)
          return alert("❌ Mật khẩu phải >= 6 ký tự");
        return alert("❌ Bạn phải đồng ý điều khoản.");
      }

      const res = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "user",
          cartItems: {}
        })
      });

      if (res.ok) {
        alert("✅ Đăng ký thành công. Mời bạn đăng nhập!");
        setCurrState("Login");
        setName('');
        setEmail('');
        setPassword('');
        setAgree(false);
      } else {
        alert("❌ Đăng ký thất bại.");
      }
    }
  };

  return (
    <div className='login-popup'>
      <form className='login-popup-container' onSubmit={handleAuth}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="close" />
        </div>
        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <input type="text" placeholder='Your Name' value={name} onChange={(e) => setName(e.target.value)} required />
            
          )}
          <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">{currState === "Sign Up" ? "Create Account" : "Login"}</button>
        {currState === "Sign Up" && (
          <div className="login-popup-condition">
            <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
            <p>I agree to the terms of use & privacy policy.</p>
          </div>
        )}
        {currState === "Login" ? (
          <p>Don't have an account? <span onClick={() => setCurrState("Sign Up")}>Sign up here</span></p>
        ) : (
          <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
