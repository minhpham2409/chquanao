import React, { useContext } from 'react'
import './foodDisplay.css'
import { StoreContext } from '../../context/StoreContext'
import FoodItem from '../FoodItem/FoodItem'

const FoodDisplay = ({category}) => {
    const {dishes} = useContext(StoreContext)

    const defaultSizes = [
        { size: 'S', quantity: 10 },
        { size: 'M', quantity: 10 },
        { size: 'L', quantity: 10 }
    ];

    return (
        <div className='food-display' id='food-display'>
            <h2>Top Picks for You</h2>
            <div className='food-display-list'>
                {dishes.map((item,index)=>{
                    if(category==='All' || category===item.category){
                        return (
                            <FoodItem 
                                key={index} 
                                id={item.id} 
                                name={item.name} 
                                description={item.description} 
                                price={item.price} 
                                image={item.image}
                                sizes={item.sizes || defaultSizes}
                            />
                        )
                    }
                    return null;
                })}
            </div>
        </div>
    )
}

export default FoodDisplay