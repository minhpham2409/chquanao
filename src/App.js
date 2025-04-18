import {  Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Cart from './pages/Cart/Cart';
import './App.css';
import Footer from './components/Footer/Footer';
import { useState } from 'react';
import LoginPopup from './components/LoginPopup/LoginPopup';
import Admin from './pages/Admin/Admin';
import Delivery from './pages/delivery/delivery';


function App() {

  const [showLogin,setShowLogin] = useState(false)

  return (
    <>
     {showLogin? <LoginPopup setShowLogin={setShowLogin}/> : <></>}
      <div className="App">
         
      <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/delivery" element={<Delivery />} />
          


        </Routes>
      </div>
      <Footer/>
    </>
  );
}

export default App;
