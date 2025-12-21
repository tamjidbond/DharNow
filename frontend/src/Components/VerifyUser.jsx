import React, { useState } from 'react';
import { auth } from './firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from 'axios';
import { FaPhone, FaUser, FaHome, FaIdCard, FaCheckCircle } from 'react-icons/fa';

const VerifyUser = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [profile, setProfile] = useState({ name: '', address: '' });
  const [idFile, setIdFile] = useState(null);

  // Helper: Convert Image to String for MongoDB
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // --- STEP 1: SEND SMS ---
  const sendCode = async () => {
    try {
      // Creates a hidden recaptcha check
      const recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const result = await signInWithPhoneNumber(auth, phone, recaptcha);
      setConfirmationResult(result);
      setStep(2);
    } catch (err) { alert("Error sending SMS: " + err.message); }
  };

  // --- STEP 2: VERIFY SMS ---
  const verifyCode = async () => {
    try {
      await confirmationResult.confirm(otp);
      setStep(3); // Phone verified, now get profile info
    } catch (err) { alert("Invalid OTP Code!"); }
  };

  // --- STEP 3: SUBMIT EVERYTHING TO MONGODB ---
  const handleFinalSubmit = async () => {
    if (!idFile || !profile.name || !profile.address) return alert("Fill all fields!");
    setLoading(true);
    try {
      const user = auth.currentUser;
      const base64Nid = await convertToBase64(idFile);

      await axios.post('http://localhost:8000/api/users/register', {
        uid: user.uid,
        phone: user.phoneNumber,
        name: profile.name,
        address: profile.address,
        nidPhoto: base64Nid // Saving the actual photo in MongoDB
      });

      setStep(4); // Success screen
    } catch (err) { alert("Database Error: " + err.message); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 font-sans">
      <div id="recaptcha-container"></div>
      
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 text-center">Verify Identity</h2>
          <p className="text-slate-500 text-sm text-center">Enter phone with country code (e.g. +880...)</p>
          <input className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="+88017XXXXXXXX" onChange={e => setPhone(e.target.value)} />
          <button onClick={sendCode} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition hover:bg-indigo-700">
            <FaPhone /> Send Verification Code
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-center">Enter SMS Code</h2>
          <input className="w-full p-4 border rounded-2xl text-center text-2xl tracking-widest" maxLength="6" placeholder="000000" onChange={e => setOtp(e.target.value)} />
          <button onClick={verifyCode} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold transition hover:bg-emerald-700">Verify Code</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-indigo-700">Profile Details</h2>
          <input className="w-full p-3 border rounded-xl" placeholder="Full Name (NID Name)" onChange={e => setProfile({...profile, name: e.target.value})} />
          <input className="w-full p-3 border rounded-xl" placeholder="Detailed Address" onChange={e => setProfile({...profile, address: e.target.value})} />
          
          <div className="border-2 border-dashed border-indigo-200 p-6 rounded-2xl bg-indigo-50 text-center">
            <label className="cursor-pointer">
              <FaIdCard className="mx-auto text-4xl text-indigo-400 mb-2" />
              <p className="text-xs font-bold text-indigo-700">UPLOAD NID PHOTO</p>
              <input type="file" className="hidden" accept="image/*" onChange={e => setIdFile(e.target.files[0])} />
            </label>
            {idFile && <p className="text-[10px] mt-2 text-slate-500 italic">{idFile.name}</p>}
          </div>

          <button onClick={handleFinalSubmit} disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition">
            {loading ? "Registering..." : "Finish Registration"}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="text-center space-y-4">
          <FaCheckCircle className="text-6xl text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold">Successfully Registered!</h2>
          <p className="text-slate-500">Your profile is being reviewed. You can now browse DharLink.</p>
          <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">Go to Map</button>
        </div>
      )}
    </div>
  );
};

export default VerifyUser;