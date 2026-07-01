import { useState, useEffect } from 'react'
import axios from 'axios'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/dashboard/')
      setStats(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏨</div>
          <div style={styles.statValue}>{stats.total_rooms}</div>
          <div style={styles.statLabel}>Total Rooms</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statValue}>{stats.available_rooms}</div>
          <div style={styles.statLabel}>Available Rooms</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔴</div>
          <div style={styles.statValue}>{stats.occupied_rooms}</div>
          <div style={styles.statLabel}>Occupied Rooms</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔧</div>
          <div style={styles.statValue}>{stats.maintenance_rooms}</div>
          <div style={styles.statLabel}>Maintenance</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>
          <div style={styles.statValue}>{stats.active_reservations}</div>
          <div style={styles.statLabel}>Active Reservations</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statValue}>{stats.total_customers}</div>
          <div style={styles.statLabel}>Total Customers</div>
        </div>
      </div>

      <div style={styles.recentSection}>
        <h2 style={styles.sectionTitle}>Recent Reservations</h2>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Reservation #</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Check In</th>
                <th style={styles.th}>Check Out</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td style={styles.td}>{reservation.reservation_number}</td>
                  <td style={styles.td}>{reservation.customer_name}</td>
                  <td style={styles.td}>{reservation.room_number}</td>
                  <td style={styles.td}>{reservation.check_in_date}</td>
                  <td style={styles.td}>{reservation.check_out_date}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(reservation.booking_status),
                      }}
                    >
                      {reservation.booking_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return '#ffc107'
    case 'confirmed':
      return '#28a745'
    case 'checked_in':
      return '#007bff'
    case 'checked_out':
      return '#6c757d'
    case 'cancelled':
      return '#dc3545'
    default:
      return '#6c757d'
  }
}

const styles = {
  container: {
    padding: '2rem',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  title: {
    marginBottom: '2rem',
    color: '#333',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: '0.5rem',
  },
  statLabel: {
    color: '#666',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  recentSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    marginBottom: '1rem',
    color: '#333',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '600',
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #ddd',
  },
  statusBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    color: 'white',
    fontSize: '0.85rem',
  },
}

export default Dashboard
