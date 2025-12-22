import React, { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaArrowRight } from 'react-icons/fa';

const Register = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendCode = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:8000/api/auth/send-otp', { email });
            setStep(2);
        } catch (err) { 
            alert("Error sending email"); 
        }
        setLoading(false);
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/auth/verify-otp', { email, otp });
            
            if (res.data.success) {
                localStorage.setItem('userEmail', email);
                
                // If this is a new user, register them automatically in the background
                if (res.data.newUser) {
                    await axios.post('http://localhost:8000/api/users/register', {
                        email: email,
                        name: "DharLink User", // Default placeholder
                        address: "Address not set",// Default placeholder
                    });
                }
                
                // Redirect to Home immediately
                window.location.href = "/";
            }
        } catch (err) { 
            alert("Invalid OTP"); 
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl border border-slate-100">
            {/* STEP 1: EMAIL INPUT */}
            {step === 1 && (
                <div className="space-y-6 text-center">
                    <h2 className="text-2xl font-black">DharLink Sign In</h2>
                    <p className="text-slate-500 text-sm">Enter your email to receive a code</p>
                    <input 
                        className="w-full p-4 border rounded-2xl bg-slate-50 outline-none focus:ring-2 ring-indigo-500" 
                        placeholder="Email Address" 
                        onChange={e => setEmail(e.target.value)} 
                    />
                    <button 
                        onClick={handleSendCode} 
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
                    >
                        {loading ? "Sending..." : "Send Code"} <FaArrowRight />
                    </button>
                </div>
            )}

            {/* STEP 2: OTP INPUT */}
            {step === 2 && (
                <div className="space-y-6 text-center">
                    <h2 className="text-2xl font-black">Enter OTP</h2>
                    <p className="text-slate-500 text-sm">Check your inbox for a 6-digit code</p>
                    <input 
                        className="w-full p-4 border rounded-2xl text-center text-3xl tracking-widest font-black bg-slate-50 outline-none focus:ring-2 ring-emerald-500" 
                        onChange={e => setOtp(e.target.value)} 
                        maxLength="6" 
                        placeholder="000000" 
                    />
                    <button 
                        onClick={handleVerifyOtp} 
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition"
                    >
                        {loading ? "Verifying..." : "Verify & Login"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Register;