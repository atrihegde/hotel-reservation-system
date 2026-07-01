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
      <aside style={styles.sidebar}>
        <div style={styles.navBrand}>Hotel Reservation System</div>
        <nav style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>Dashboard</Link>
          <Link to="/rooms" style={styles.navLink}>Rooms</Link>
          <Link to="/customers" style={styles.navLink}>Customers</Link>
          <Link to="/reservations" style={styles.navLink}>Reservations</Link>
        </nav>
        <div style={styles.userSection}>
          <span style={styles.userInfo}>{user?.username}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </aside>
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
    backgroundColor: '#f4f7fb',
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #007bff 0%, #0056b3 100%)',
    color: 'white',
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  navBrand: {
    fontSize: '1.3rem',
    fontWeight: '700',
    lineHeight: 1.3,
  },
  navLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    padding: '0.7rem 0.9rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  userSection: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.2)',
  },
  userInfo: {
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.25)',
    padding: '0.6rem 0.9rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  main: {
    flex: 1,
    padding: '2rem',
  },
}

export default Layout
