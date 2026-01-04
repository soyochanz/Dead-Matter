import React from 'react';
import WikiCategoryPage from './WikiCategoryPage';

const VehiclesPage = () => {
    return (
        <WikiCategoryPage 
            category="vehicles" 
            customTitle="Vehicles" 
            customSubtitle="Traverse the wasteland with cars, trucks, and transport vehicles"
            customDescription="Browse all driveable vehicles, cars, and trucks in Dead Matter. Learn about fuel capacity, speed, and durability." 
        />
    );
};

export default VehiclesPage;
