import React, { useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

const Navbar = () => {

  return (
    <div className='title'>
      <img src={assets.logo} alt="" className='logo' width="80px"/>
    <h1>XPressify</h1>
    </div>
  )
}

export default Navbar
