import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaBullhorn, FaMagic } from 'react-icons/fa';

const PostWish = ({ onWishPosted }) => {
  const [wish, setWish] = useState({ name: '', category: '', description: '' });
  const userEmail = localStorage.getItem('userEmail');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // We save this to a NEW collection in MongoDB called 'wishes'
      await axios.post('https://dharnow.onrender.com/api/wishes/create', {
        ...wish,
        requesterEmail: userEmail,
        status: 'open'
      });
      
      Swal.fire({
        title: 'Wish Broadcasted!',
        text: 'Your neighbors will see this on the Request Board.',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'rounded-[2rem]' }
      });
      setWish({ name: '', category: '', description: '' });
      if(onWishPosted) onWishPosted(); 
    } catch (err) {
      Swal.fire('Error', 'Could not post wish', 'error');
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[3rem] text-white shadow-2xl mb-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md"><FaBullhorn size={24}/></div>
        <h2 className="text-3xl font-black tracking-tight">Can't find something?</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          type="text" 
          placeholder="What do you need? (e.g. Drill Machine)" 
          className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:bg-white/20 placeholder:text-white/60 font-bold"
          value={wish.name}
          onChange={(e) => setWish({...wish, name: e.target.value})}
          required
        />
        <select 
          className="bg-white/10 border border-white/20 p-4 rounded-2xl outline-none focus:bg-white/20 font-bold"
          value={wish.category}
          onChange={(e) => setWish({...wish, category: e.target.value})}
        >
          <option value="" className='text-slate-900'>Select Category</option>
          <option value="Tools" className='text-slate-900'>Tools</option>
          <option value="Electronics" className='text-slate-900'>Electronics</option>
          <option value="Kitchen" className='text-slate-900'>Kitchen</option>
        </select>
        <button type="submit" className="bg-white text-indigo-600 font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-emerald-400 hover:text-white transition-all flex items-center justify-center gap-2">
          <FaMagic /> Broadcast Wish
        </button>
      </form>
    </div>
  );
};