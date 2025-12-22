import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router';
import { FaDirections } from 'react-icons/fa';

const ItemMapView = ({ filteredItems, userCoords }) => (
  <div className="bg-white p-2 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden h-[600px] z-0">
    <MapContainer center={userCoords || [23.8103, 90.4125]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '2rem' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {filteredItems.map((item) => {
        const pos = item.location?.coordinates ? [item.location.coordinates[1], item.location.coordinates[0]] : null;
        return pos ? (
          <Marker key={item._id} position={pos}>
            <Popup className="custom-popup">
              <div className="p-1 w-48">
                <img src={item.image} className="w-full h-24 object-cover rounded-xl mb-2" alt="" />
                <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1">{item.title}</h3>
                <p className="text-indigo-600 font-black text-xs mb-3">৳{item.price}/{item.priceType}</p>
                <Link to={`/item/${item._id}`} className="block text-center bg-indigo-600 text-white text-[10px] font-black uppercase py-2 rounded-lg mb-2">View Details</Link>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`} target="_blank" rel="noreferrer" className="block text-center bg-slate-100 text-slate-700 text-[10px] font-black uppercase py-2 rounded-lg"><FaDirections className="inline mr-1" /> Directions</a>
              </div>
            </Popup>
          </Marker>
        ) : null;
      })}
    </MapContainer>
  </div>
);

export default ItemMapView;