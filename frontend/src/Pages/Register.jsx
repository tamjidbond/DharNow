import React, { useState } from 'react';
import axios from 'axios';
import { auth, googleProvider } from '../firebase'; // Ensure you have firebase.js setup
import { signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import Swal from 'sweetalert2';

const Register = () => {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        console.log("1. Starting Google Sign In..."); // Check console for this
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log("2. Google accepted! User:", result.user.email);

            const res = await axios.post('https://dharnow.onrender.com/api/auth/google-login', {
                email: result.user.email,
                name: result.user.displayName,
                photoURL: result.user.photoURL
            });
            console.log("3. Backend response:", res.data);

            if (res.data.success) {
                localStorage.setItem('userEmail', result.user.email);
                window.location.href = "/";
            }
        } catch (err) {
            console.error("❌ ERROR AT STEP:", err.code, err.message);
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-2xl border border-slate-100 text-center">
            <h2 className="text-3xl font-black mb-2">DharNow</h2>
            <p className="text-slate-500 mb-8">Borrow and Lend with your Neighbors</p>

            <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
                <FcGoogle size={24} />
                {loading ? "Connecting..." : "Continue with Google"}
            </button>

            <p className="mt-6 text-xs text-slate-400">
                By signing in, you agree to our Community Guidelines.
            </p>
        </div>
    );
};

export default Register;