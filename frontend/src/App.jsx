// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import Swal from 'sweetalert2';

// // Icons
// import { FaPlusCircle, FaBoxOpen, FaMapMarkedAlt, FaHandsHelping, FaCamera } from 'react-icons/fa';
// import { IoLocationSharp, IoPersonCircleOutline } from 'react-icons/io5';
// import { MdOutlineDescription } from 'react-icons/md';

// // Leaflet CSS and Icon Fix
// import 'leaflet/dist/leaflet.css';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// let DefaultIcon = L.icon({
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// function App() {
//   const [items, setItems] = useState([]);
//   const [formData, setFormData] = useState({ title: '', description: '' });
//   const [image, setImage] = useState("");
//   const [loading, setLoading] = useState(false);

//   // 1. Fetch all items from Backend
//   const fetchItems = async () => {
//     try {
//       const response = await axios.get('https://dharnow.onrender.com/api/items/all');
//       setItems(response.data);
//     } catch (error) {
//       console.error("Backend connection failed", error);
//     }
//   };

//   useEffect(() => { fetchItems(); }, []);

//   // 2. Handle Image Upload to Cloudinary
//   const uploadImage = async (e) => {
//     const files = e.target.files;
//     const data = new FormData();
//     data.append('file', files[0]);
//     data.append('upload_preset', 'DharNow_uploads');

//     setLoading(true);
//     try {
//       const res = await fetch(
//         "https://api.cloudinary.com/v1_1/dh564gxy5/image/upload",
//         { method: "POST", body: data }
//       );
//       const file = await res.json();
//       setImage(file.secure_url);
//       setLoading(false);
//     } catch (err) {
//       console.error("Upload failed", err);
//       setLoading(false);
//     }
//   };

//   // 3. Handle Form Submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // 1. Basic Validation
//     if (!image) {
//       return Swal.fire({
//         icon: 'warning',
//         title: 'Image Required',
//         text: 'Please upload a photo of the item so neighbors can see it.',
//         confirmButtonColor: '#4f46e5'
//       });
//     }

//     // 2. Show Loading UI (Important for large image uploads)
//     Swal.fire({
//       title: 'Posting your item...',
//       text: 'Please wait while we link it to the map.',
//       allowOutsideClick: false,
//       didOpen: () => {
//         Swal.showLoading();
//       }
//     });

//     try {
//       const userEmail = localStorage.getItem('userEmail');

//       await axios.post('https://dharnow.onrender.com/api/items/add', {
//         ...formData,
//         image: image,
//         lentBy: userEmail, // Correctly linking to the logged-in user
//         category: formData.category || "General",
//         // Randomize location slightly around Dhaka center
//         coordinates: [90.4125 + (Math.random() - 0.5) * 0.02, 23.8103 + (Math.random() - 0.5) * 0.02],
//       });

//       // 3. Success Feedback
//       Swal.fire({
//         icon: 'success',
//         title: 'Item Posted!',
//         text: 'Your item is now live on the DharNow map.',
//         timer: 2000,
//         showConfirmButton: false
//       });

//       // 4. Reset Form
//       setFormData({ title: '', description: '', price: '', priceType: 'Daily' });
//       setImage("");
//       if (fetchItems) fetchItems(); // Refresh the list if the function exists

//     } catch (error) {
//       console.error("Post Error:", error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Upload Failed',
//         text: 'The image might be too large. Try a smaller photo (under 5MB).',
//         confirmButtonColor: '#ef4444'
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
//       {/* HEADER */}
//       <header className="bg-indigo-600 text-white py-6 shadow-lg">
//         <div className="container mx-auto px-4 flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <FaHandsHelping className="text-3xl text-yellow-400" />
//             <h1 className="text-3xl font-extrabold tracking-tight">DharNow</h1>
//           </div>
//           <p className="hidden sm:block font-medium opacity-90">Community Sharing Portal</p>
//         </div>
//       </header>

//       <main className="container mx-auto py-10 px-4">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

//           {/* LEFT: FORM SECTION */}
//           <div className="lg:col-span-4">
//             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-10">
//               <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-700">
//                 <FaPlusCircle /> List a New Item
//               </h2>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Item Name</label>
//                   <input
//                     className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-200 outline-none"
//                     placeholder="e.g. Electric Drill"
//                     value={formData.title}
//                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
//                   <textarea
//                     className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 h-24 resize-none"
//                     placeholder="Condition, lending duration, etc..."
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     required
//                   />
//                 </div>

//                 {/* Image Upload Input */}
//                 <div>
//                   <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Item Photo</label>
//                   <div className="flex items-center justify-center w-full">
//                     <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition">
//                       <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                         <FaCamera className="text-slate-400 mb-2 text-xl" />
//                         <p className="text-xs text-slate-500">{loading ? "Uploading..." : "Click to upload"}</p>
//                       </div>
//                       <input type="file" className="hidden" onChange={uploadImage} />
//                     </label>
//                   </div>
//                   {image && <p className="text-[10px] text-green-600 mt-1 font-bold">✓ Image Ready</p>}
//                 </div>

//                 <button
//                   disabled={loading}
//                   className={`w-full ${loading ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95`}
//                 >
//                   {loading ? "Please wait..." : "Post to Neighborhood"}
//                 </button>
//               </form>
//             </div>
//           </div>

//           {/* RIGHT: MAP AND LIST SECTION */}
//           <div className="lg:col-span-8 space-y-8">

//             {/* THE MAP */}
//             <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200">
//               <div className="h-[400px] w-full rounded-2xl overflow-hidden">
//                 <MapContainer center={[23.8103, 90.4125]} zoom={13} style={{ height: '100%', width: '100%' }}>
//                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                   {items.map((item) => (
//                     item.coordinates && (
//                       <Marker key={item._id} position={[item.coordinates[1], item.coordinates[0]]}>
//                         <Popup>
//                           <div className="text-center">
//                             <h4 className="font-bold text-indigo-600">{item.title}</h4>
//                             {item.image && <img src={item.image} className="w-20 h-20 object-cover mx-auto my-2 rounded-lg" />}
//                           </div>
//                         </Popup>
//                       </Marker>
//                     )
//                   ))}
//                 </MapContainer>
//               </div>
//             </div>

//             {/* ITEM CARDS */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {items.map((item) => (
//                 <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition">
//                   {item.image && (
//                     <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
//                   )}
//                   <div className="p-5">
//                     <div className="flex justify-between items-start mb-2">
//                       <h3 className="text-xl font-bold text-slate-800">{item.title}</h3>
//                       <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-black uppercase">FREE</span>
//                     </div>
//                     <p className="text-slate-500 text-sm mb-6 line-clamp-2 italic">"{item.description}"</p>
//                     <div className="flex items-center justify-between border-t pt-4">
//                       <div className="flex items-center gap-2 text-slate-500 text-xs">
//                         <IoPersonCircleOutline className="text-lg" />
//                         <span>Neighbor</span>
//                       </div>
//                       <button className="text-indigo-600 font-bold text-xs flex items-center gap-1">
//                         <IoLocationSharp /> View on Map
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;