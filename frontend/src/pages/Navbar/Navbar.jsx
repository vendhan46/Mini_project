import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'
import { assets } from '../../assets/assets'
import api from '../../utils/api'
import { clearSession, getStoredUser, isLoggedIn } from '../../utils/auth'

const Navbar = () => {
  const [user, setUser] = useState(getStoredUser())
  const navigate = useNavigate()

  useEffect(() => {
    const syncAuth = () => {
      setUser(getStoredUser())
    }

    window.addEventListener('auth-changed', syncAuth)
    window.addEventListener('storage', syncAuth)

    return () => {
      window.removeEventListener('auth-changed', syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
    }

    clearSession()
    navigate('/auth')
  }

  return (
    <div className='title'>
      <div className='brand'>
        <img src={assets.logo} alt="" className='logo' width="80px"/>
        <h1>XPressify</h1>
      </div>

      <div className='nav-links'>
        <Link to='/'>Home</Link>
        <Link to='/webcapture'>Capture</Link>
        {isLoggedIn() && <Link to='/dashboard'>Dashboard</Link>}

        {user ? (
          <>
            <span className='user-name'>{user.name}</span>
            <button className='logout-btn' onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to='/auth'>Login</Link>
        )}
      </div>
    </div>
  )
}

export default Navbar
