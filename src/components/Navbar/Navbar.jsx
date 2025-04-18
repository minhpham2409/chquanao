import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";


const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { isAdmin, currentUser, setCurrentUser, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate(); 

  const handleLogout = () => {
    setCurrentUser(null);
    setCartItems({});
    localStorage.removeItem("currentUser");
    navigate("/"); 
  };
  
  const handleAdmin=()=>{
      navigate("/admin")
      setMenu("admin")
  }
  const handleDelivery=()=>{
    navigate("/delivery")
      setMenu("delivery")
  }

  return (
    <div className="navbar">
      <Link to="/"><img src={assets.logo2} className="logo" alt="Logo" /></Link>
      <ul className="navbar-menu">
      {currentUser?.role==="Admin"?<li className={menu === "admin" ? "active" : ""} onClick={() => handleAdmin()}>Admin</li>:
      <></>}
      
        <li className={menu === "home" ? "active" : ""} onClick={() => setMenu("home")}>Home</li>
        <li className={menu === "menu" ? "active" : ""} onClick={() => setMenu("menu")}>Menu</li>
        <li className={menu === "mobile_app" ? "active" : ""} onClick={() => setMenu("mobile_app")}>Mobile-app</li>
        <li className={menu === "contact" ? "active" : ""} onClick={() => setMenu("contact")}>Contact us</li>
        <li className={menu === "delivery" ? "active" : ""} onClick={() => handleDelivery()}>Order</li>
      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="Search Icon" />
        <div className="navbar-search-icon">
        {(currentUser)?<Link to="/cart" ><img src={assets.basket_icon} alt="Basket Icon" /></Link>:
                    <img onClick={()=>{alert('M phai dang nhap moi co the truy cap gio')}} src={assets.basket_icon} alt="Basket Icon" />
                    }
          <div className="dot"></div>
        </div>
        {currentUser?.id ? (
          <button onClick={handleLogout}>
            <img src={assets.logout_icon} alt="Logout" />
          </button>
        ) : (
          <button onClick={() => setShowLogin(true)}>Sign in</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
