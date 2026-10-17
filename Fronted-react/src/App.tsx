import { useLayoutEffect, useState, useTransition } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import Login from './Components/login.jsx';
import Signup from './Components/signup.jsx';
import AdminSignup from './Components/adminSignup.jsx';
import Dashboard from './Components/dashboard.jsx';
import ForgetPassword from './Components/forgetPassword.jsx';
import ResetPassword from './Components/resetPassword.jsx';
import NotFound from './Components/notFound.jsx';
import Profile from './Components/profile.jsx';
import UsersManagement from './Components/usersManagement.jsx';
import AdminUserProfile from './Components/adminUserProfile.jsx';
import Planner from './Components/planner.jsx';
import { Link } from 'react-router-dom'

import './App.css';

export default function App(){
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/adminSignup" element={<AdminSignup/>}/>
      <Route path='/forgetPassword' element={<ForgetPassword/>}/>
      <Route path='/resetPassword' element={<ResetPassword/>}/>
      <Route path='/profile' element={<Profile/>}/>
      <Route path='/usersManagement' element={<UsersManagement/>}/>
      <Route path='/adminUserProfile/:userId' element={<AdminUserProfile/>}/>
      <Route path='/planner' element={<Planner/>}/>


      <Route path="/dashboard" element={<Dashboard/>}/>

      <Route path="/" element={<Navigate to="/dashboard"/>}/>

      <Route path="*" element={<NotFound/>}/>
    </Routes>
  )
}