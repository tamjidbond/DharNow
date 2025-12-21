import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { FaEnvelope, FaLock, FaIdCard, FaArrowRight, FaUser } from 'react-icons/fa';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Profile
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Profile State
    const [profile, setProfile] = useState({ name: '', address: '' });
    const [idFile, setIdFile] = useState(null);

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleSendCode = async () => {
        if (!email) return alert("Please enter email");
        setLoading(true);
        try {
            await axios.post('http://localhost:8000/api/auth/send-otp', { email });
            setStep(2);
        } catch (err) {
            alert("Error: " + err.message);
        }
        setLoading(false);
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/auth/verify-otp', { email, otp });
            if (res.data.success) {
                // Save session
                localStorage.setItem('userEmail', email);
                
                if (res.data.newUser) {
                    setStep(3);
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            alert("Invalid or Expired OTP");
        }
        setLoading(false);
    };

    const handleFinalSubmit = async () => {
        if (!idFile) return alert("Please upload NID");
        setLoading(true);
        try {
            const base64Nid = await convertToBase64(idFile);
            await axios.post('http://localhost:8000/api/users/register', {
                email: email,
                name: profile.name,
                address: profile.address,
                nidPhoto: base64Nid
            });
            navigate('/');
        } catch (err) {
            alert("Save failed: " + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
            {step === 1 && (
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaEnvelope className="text-indigo-600 text-2xl" />
                        </div>
                        <h2 className="text-2xl font-bold">Welcome to DharLink</h2>
                        <p className="text-slate-500">Enter your email to get an OTP</p>
                    </div>
                    <input
                        className="w-full p-4 border rounded-2xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="yourname@gmail.com"
                        type="email"
                        onChange={e => setEmail(e.target.value)}
                    />
                    <button onClick={handleSendCode} disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                        {loading ? "Sending..." : "Send OTP Code"} <FaArrowRight />
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-center">Enter Code</h2>
                    <p className="text-center text-slate-500 text-sm">Sent to {email}</p>
                    <input
                        className="w-full p-4 border rounded-2xl text-center text-3xl tracking-widest font-black"
                        maxLength="6"
                        placeholder="000000"
                        onChange={e => setOtp(e.target.value)}
                    />
                    <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold">
                        {loading ? "Verifying..." : "Verify Code"}
                    </button>
                    <button onClick={() => setStep(1)} className="w-full text-slate-400 text-sm">Back</button>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-indigo-700">One Last Step!</h2>
                    <input className="w-full p-3 border rounded-xl" placeholder="Full Name" onChange={e => setProfile({ ...profile, name: e.target.value })} />
                    <input className="w-full p-3 border rounded-xl" placeholder="Address" onChange={e => setProfile({ ...profile, address: e.target.value })} />
                    <div className="border-2 border-dashed border-slate-200 p-6 rounded-2xl text-center cursor-pointer hover:bg-slate-50 transition">
                        <label>
                            <FaIdCard className="mx-auto text-3xl text-slate-300 mb-2" />
                            <p className="text-xs font-bold text-slate-500">UPLOAD NID PHOTO</p>
                            <input type="file" className="hidden" accept="image/*" onChange={e => setIdFile(e.target.files[0])} />
                        </label>
                        {idFile && <p className="text-[10px] mt-2 text-indigo-600 font-bold italic">{idFile.name}</p>}
                    </div>
                    <button onClick={handleFinalSubmit} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">Complete Registration</button>
                </div>
            )}
        </div>
    );
};

export default Register;