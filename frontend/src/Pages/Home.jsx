import React, { useEffect, useState } from 'react';
import axios from 'axios';
import L from 'leaflet';

// COMPONENT IMPORTS
import SearchBar from '../Components/home-components/SearchBar';
import CategoryFilters from '../Components/home-components/CategoryFilters';
import ItemMapView from '../Components/home-components/ItemMapView';
import ItemGrid from '../Components/home-components/ItemGrid';

// LEAFLET ICON FIX
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const Home = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(["All"]); // Default to "All"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [locationSearch, setLocationSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [userCoords, setUserCoords] = useState(null);
  const [isSortingNearest, setIsSortingNearest] = useState(false);

  useEffect(() => {
      // Check the email stored in localStorage
      const storedEmail = localStorage.getItem('userEmail');
  
      // If it's not your specific admin email, kick them to the home page
      if (storedEmail == 'bondtamjid02@gmail.com') {
        window.location.href = "/admin";
      }
    }, []);

  useEffect(() => {
    // 1. Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => setUserCoords([pos.coords.latitude, pos.coords.longitude]));
    }

    // 2. Fetch Data (Items and Categories)
    const fetchData = async () => {
      try {
        const [itemsRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:8000/api/items/all'),
          axios.get('http://localhost:8000/api/categories') // Your new endpoint
        ]);

        setItems(itemsRes.data);
        
        // Map the category objects to just their names for the filter buttons
        const dbCategoryNames = categoriesRes.data.map(cat => cat.name);
        setCategories(["All", ...dbCategoryNames]);

      } catch (err) {
        console.error("Error fetching home data:", err);
      }
    };
    fetchData();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return parseFloat((R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))).toFixed(1));
  };

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesLocation = !locationSearch || (item.address && item.address.toLowerCase().includes(locationSearch.toLowerCase()));
      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      if (!isSortingNearest || !userCoords) return 0;
      const distA = a.location?.coordinates ? calculateDistance(userCoords[0], userCoords[1], a.location.coordinates[1], a.location.coordinates[0]) : 9999;
      const distB = b.location?.coordinates ? calculateDistance(userCoords[0], userCoords[1], b.location.coordinates[1], b.location.coordinates[0]) : 9999;
      return distA - distB;
    });

  const resetFilters = () => {
    setSearchTerm(""); setSelectedCategory("All"); setLocationSearch(""); setIsSortingNearest(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "All" || locationSearch || isSortingNearest;

  return (
    <div className="space-y-6 animate-fadeIn p-4 max-w-7xl mx-auto pb-20">
      <SearchBar 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        locationSearch={locationSearch} setLocationSearch={setLocationSearch}
        isSortingNearest={isSortingNearest} setIsSortingNearest={setIsSortingNearest}
        userCoords={userCoords} viewMode={viewMode} setViewMode={setViewMode}
      />

      <CategoryFilters 
        categories={categories} selectedCategory={selectedCategory} 
        setSelectedCategory={setSelectedCategory} resetFilters={resetFilters} 
        hasActiveFilters={hasActiveFilters} 
      />

      {viewMode === 'map' ? (
        <ItemMapView filteredItems={filteredItems} userCoords={userCoords} />
      ) : (
        <ItemGrid filteredItems={filteredItems} userCoords={userCoords} calculateDistance={calculateDistance} resetFilters={resetFilters} />
      )}
    </div>
  );
};

export default Home;