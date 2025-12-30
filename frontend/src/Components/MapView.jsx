import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons not showing up in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapView = () => {
    const [items, setItems] = useState([]);
    const [center] = useState([23.8103, 90.4125]); // Default center (Dhaka)

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get('https://dharnow.onrender.com/api/items/all');
                // Filter only available items to show on map
                setItems(res.data.filter(item => item.status === 'available'));
            } catch (err) {
                console.error("Error fetching map items:", err);
            }
        };
        fetchItems();
    }, []);

    return (
        <div className="h-[500px] w-full rounded-3xl overflow-hidden shadow-inner border-4 border-white relative z-10">
            <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {items.map((item) => (
                    <Marker key={item._id} position={item.coordinates}>
                        <Popup className="custom-popup">
                            <div className="p-1">
                                <img src={item.image} alt="" className="w-full h-20 object-cover rounded-lg mb-2" />
                                <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
                                <p className="text-xs text-slate-500 mb-2 truncate">{item.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-indigo-600 font-bold text-xs">৳{item.price}/{item.priceType}</span>
                                    <a
                                        href={`/item/${item._id}`}
                                        className="bg-indigo-600 text-white px-3 py-1 rounded-md text-[10px] font-bold"
                                    >
                                        View Item
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;