import React from 'react'
import "./Home.css"
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import { useState } from 'react'
import { useContext } from 'react'
import FoodDisplay from '../../components/foodDisplay/foodDisplay'
import { StoreContext } from '../../context/StoreContext'

const Home = () => {
  const [category, setCategory] = useState("All")
  const {dishes} =useContext(StoreContext)
  console.log(dishes)
  return (
    <div>

    <Header />
    <ExploreMenu  category={category} setCategory={setCategory} />
    <FoodDisplay category={category} />
    </div>
  )
}

export default Home