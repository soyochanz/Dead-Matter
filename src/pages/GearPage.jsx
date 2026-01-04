import React from 'react';
import WikiCategoryPage from './WikiCategoryPage';

const GearPage = () => {
    return (
        <WikiCategoryPage 
            category="gear" 
            customTitle="Gear" 
            customSubtitle="Protect yourself with armor, tactical clothing, and utility gear"
            customDescription="Explore tactical gear, armor, backpacks, and clothing available in Dead Matter to improve your survival chances." 
        />
    );
};

export default GearPage;