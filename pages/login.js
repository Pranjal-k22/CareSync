// pages/login.js
import React from 'react';
import Head from 'next/head';
import SignIn from '@/components/Auth/SignIn';
import Footer from '@/components/Footer';

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between">
      <Head>
        <title>Login & Authentication | HealConnect Portal</title>
      </Head>
      <SignIn />
      <Footer />
    </div>
  );
}