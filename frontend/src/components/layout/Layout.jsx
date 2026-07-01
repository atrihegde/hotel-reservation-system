import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>Hotel Reservation System</div>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Dashboard</Link>
          <Link to="/rooms" style={styles.navLink}>Rooms</Link>
          <Link to="/customers" style={styles.navLink}>Customers</Link>
          <Link to="/reservations" style={styles.navLink}>Reservations</Link>
          <span style={styles.userInfo}>
            {user?.username}
          </span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </nav>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBrand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  userInfo: {
    color: 'white',
    fontSize: '0.9rem',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  main: {
    flex: 1,
    padding: '2rem',
  },
}

export default Layout
