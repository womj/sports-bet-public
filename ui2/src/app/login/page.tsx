"use client"

import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation'

const Login = () => {
  const [password, setPassword] = useState('');
  const [cookies, setCookie] = useCookies(['Auth']);

  const router = useRouter()

  const handleLogin = () => {
    // Here, you might want to perform some authentication logic.
    // For simplicity, I'll set a dummy cookie with the password as the value.
    setCookie('Auth', password, { path: '/' });
    router.push('ncaab/home');
  };

  return (
    <div>
      <label>Password:</label>
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
