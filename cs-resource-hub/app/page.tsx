'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, ShieldCheck, Hash } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@st.knust.edu.gh')) {
      setError('Please use a valid student email ending in @st.knust.edu.gh');
      return;
    }
    setError('');
    setSent(true);
    
    // Simulate login redirect for dev demo
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mb-4 font-bold text-xl">
            CS
          </div>
          <h1 className="text-2xl font-bold text-slate-800">CS Resource Hub</h1>
          <p className="text-slate-500 text-sm mt-1">KNUST Computer Science Department</p>
        </div>

        {sent ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-center">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
            <p className="font-semibold">Magic Link Sent!</p>
            <p className="text-xs mt-1 text-emerald-600">Check your Zimbra mailbox ({email}) to complete sign-in.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                KNUST Student Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="username@st.knust.edu.gh"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Index Number (Profile)
              </label>
              <div className="relative">
                <Hash className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="20812345"
                  value={indexNumber}
                  onChange={(e) => setIndexNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              Send Magic Link <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}