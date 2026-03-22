/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, db, onAuthStateChanged, signInWithPopup, googleProvider, signOut, doc, getDoc, setDoc, OperationType, handleFirestoreError } from './firebase';
import { UserProfile, UserRole } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Teachers } from './components/Teachers';
import { Classes } from './components/Classes';
import { Grades } from './components/Grades';
import { Attendance } from './components/Attendance';
import { Fees } from './components/Fees';
import { TransportComponent as Transport } from './components/Transport';
import { UsersManagement as UsersList } from './components/Users';
import { LogIn, GraduationCap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const existingUser = userDoc.data() as UserProfile;
            const isAdminEmail = firebaseUser.email === 'OrlandoJo31@gmail.com';
            
            // Ensure admin email always has admin role
            if (isAdminEmail && existingUser.role !== 'admin') {
              const updatedUser = { ...existingUser, role: 'admin' as UserRole };
              await setDoc(doc(db, 'users', firebaseUser.uid), updatedUser);
              setUser(updatedUser);
            } else {
              setUser(existingUser);
            }
          } else {
            // New user, default to parent or check if it's the admin email
            const isAdminEmail = firebaseUser.email === 'OrlandoJo31@gmail.com';
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email || '',
              role: isAdminEmail ? 'admin' : 'parent',
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-stone-200"
        >
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">EscolaFácil</h1>
          <p className="text-stone-500 mb-8 italic serif">Gestão escolar simples e eficiente para o futuro dos nossos alunos.</p>
          
          <button
            onClick={handleLogin}
            className="w-full bg-stone-900 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-lg"
          >
            <LogIn className="w-5 h-5" />
            Entrar com Google
          </button>
          
          <p className="mt-6 text-xs text-stone-400 uppercase tracking-widest font-mono">
            Acesso Restrito a Colaboradores e Responsáveis
          </p>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} setActiveTab={setActiveTab} />;
      case 'students': return <Students user={user} />;
      case 'teachers': return <Teachers user={user} />;
      case 'classes': return <Classes user={user} />;
      case 'grades': return <Grades user={user} />;
      case 'attendance': return <Attendance user={user} />;
      case 'fees': return <Fees user={user} />;
      case 'transport': return <Transport user={user} />;
      case 'users': return <UsersList user={user} />;
      default: return <Dashboard user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout user={user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

