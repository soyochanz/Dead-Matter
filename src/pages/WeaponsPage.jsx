import React from 'react';
import WikiCategoryPage from './WikiCategoryPage';

const WeaponsPage = () => {

    const seoElements = [
        <title key="title">Dead Matter Weapons (Full Stats & Ammo Types) | Wiki</title>,

        <meta key="description" 
            name="description" 
            content="Complete Dead Matter Weapons Database. View stats, rarity, ammo calibers, recoil, spawn locations, and weapon types including assault rifles, pistols, shotguns, SMGs, rifles and melee." 
        />,

        <meta key="keywords" 
            name="keywords" 
            content="Dead Matter Weapons, Dead Matter Guns, Dead Matter MP7, Dead Matter HK416, Dead Matter SMGs, Dead Matter Pistols, Weapon Stats Dead Matter, Dead Matter Damage Values" 
        />,

        <meta key="og:title" property="og:title" content="Dead Matter Weapons | Full Stats & Ammo Types" />,
        <meta key="og:description" property="og:description" content="Browse every weapon in Dead Matter with stats, ammo, damage, recoil and spawn locations." />,
        <meta key="og:type" property="og:type" content="website" />,
        <meta key="og:url" property="og:url" content="https://deadmatter.wiki/wiki/weapons" />,
        <meta key="og:image" property="og:image" content="https://deadmatter.wiki/images/preview/weapons-cover.jpg" />,

        <script key="json-ld" type="application/ld+json">
            {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "Dead Matter Weapons List",
                "description": "Complete database of weapons in Dead Matter with damage, ammo, rarity and usage.",
                "url": "https://deadmatter.wiki/wiki/weapons",
                "itemListOrder": "Unordered",
                "itemListElement": []
            })}
        </script>
    ];

    return (
        <WikiCategoryPage 
            category="weapons" 
            customTitle="Dead Matter Weapons" 
            customSubtitle="Browse the full arsenal with stats, rarity and ammo types"
            customDescription="Discover every weapon in Dead Matter including guns, melee tools, attachments and calibers. View damage, recoil, fire rate and spawn information."
            extraHeadElements={seoElements}
        />
    );
};

export default WeaponsPage;