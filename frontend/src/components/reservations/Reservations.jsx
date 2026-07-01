import { useState, useEffect } from 'react'
import axios from 'axios'

const Reservations = () => {
  const [reservations, setReservations] = useState([])
  const [customers, setCustomers] = useState([])
  const [rooms, setRooms] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [availabilityCheck, setAvailabilityCheck] = useState(null)

  const [formData, setFormData] = useState({
    reservation_number: '',
    customer: '',
    room: '',
    check_in_date: '',
    check_out_date: '',
    number_of_guests: 1,
    booking_status: 'pending',
  })

  useEffect(() => {
    fetchReservations()
    fetchCustomers()
    fetchRooms()
  }, [])

  const fetchReservations = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/reservations/')
      setReservations(response.data)
    } catch (error) {
      console.error('Error fetching reservations:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/customers/')
      setCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/rooms/')
      setRooms(response.data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const checkAvailability = async () => {
    if (formData.room && formData.check_in_date && formData.check_out_date) {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/reservations/check_availability/?room_id=${formData.room}&check_in=${formData.check_in_date}&check_out=${formData.check_out_date}`
        )
        setAvailabilityCheck(response.data)
      } catch (error) {
        console.error('Error checking availability:', error)
      }
    }
  }

  useEffect(() => {
    if (showModal) {
      checkAvailability()
    }
  }, [formData.room, formData.check_in_date, formData.check_out_date])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (availabilityCheck && !availabilityCheck.available) {
      alert('Room is not available for the selected dates')
      return
    }

    try {
      if (editingReservation) {
        await axios.put(
          `http://localhost:8000/api/reservations/${editingReservation.id}/`,
          formData
        )
      } else {
        await axios.post('http://localhost:8000/api/reservations/', formData)
      }
      setShowModal(false)
      setEditingReservation(null)
      setAvailabilityCheck(null)
      setFormData({
        reservation_number: '',
        customer: '',
        room: '',
        check_in_date: '',
        check_out_date: '',
        number_of_guests: 1,
        booking_status: 'pending',
      })
      fetchReservations()
    } catch (error) {
      console.error('Error saving reservation:', error)
      alert(error.response?.data?.detail || 'Error saving reservation')
    }
  }

  const handleEdit = (reservation) => {
    setEditingReservation(reservation)
    setFormData({
      reservation_number: reservation.reservation_number,
      customer: reservation.customer,
      room: reservation.room,
      check_in_date: reservation.check_in_date,
      check_out_date: reservation.check_out_date,
      number_of_guests: reservation.number_of_guests,
      booking_status: reservation.booking_status,
    })
    setShowModal(true)
  }

  const handleCancel = async (reservationNumber) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await axios.post('http://localhost:8000/api/reservations/cancel/', {
          reservation_id: reservationNumber,
        })
        fetchReservations()
      } catch (error) {
        console.error('Error cancelling reservation:', error)
        alert('Error cancelling reservation')
      }
    }
  }

  const handleAdd = () => {
    setEditingReservation(null)
    setAvailabilityCheck(null)
    setFormData({
      reservation_number: `RES-${Date.now()}`,
      customer: '',
      room: '',
      check_in_date: '',
      check_out_date: '',
      number_of_guests: 1,
      booking_status: 'pending',
    })
    setShowModal(true)
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Reservation Management</h1>
        <button onClick={handleAdd} style={styles.addButton}>
          New Reservation
        </button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Reservation #</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Room</th>
              <th style={styles.th}>Check In</th>
              <th style={styles.th}>Check Out</th>
              <th style={styles.th}>Guests</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td style={styles.td}>{reservation.reservation_number}</td>
                <td style={styles.td}>{reservation.customer_name}</td>
                <td style={styles.td}>{reservation.room_number}</td>
                <td style={styles.td}>{reservation.check_in_date}</td>
                <td style={styles.td}>{reservation.check_out_date}</td>
                <td style={styles.td}>{reservation.number_of_guests}</td>
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
                <td style={styles.td}>
                  <button
                    onClick={() => handleEdit(reservation)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  {reservation.booking_status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancel(reservation.reservation_number)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingReservation ? 'Edit Reservation' : 'New Reservation'}
            </h2>
            {availabilityCheck && (
              <div
                style={{
                  ...styles.availabilityAlert,
                  backgroundColor: availabilityCheck.available ? '#d4edda' : '#f8d7da',
                  color: availabilityCheck.available ? '#155724' : '#721c24',
                }}
              >
                {availabilityCheck.available
                  ? 'Room is available for these dates'
                  : 'Room is NOT available for these dates'}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Reservation Number</label>
                <input
                  type="text"
                  value={formData.reservation_number}
                  onChange={(e) =>
                    setFormData({ ...formData, reservation_number: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Customer</label>
                <select
                  value={formData.customer}
                  onChange={(e) =>
                    setFormData({ ...formData, customer: parseInt(e.target.value) })
                  }
                  style={styles.input}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} ({customer.customer_id})
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Room</label>
                <select
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: parseInt(e.target.value) })
                  }
                  style={styles.input}
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number} - {room.room_type} (${room.price_per_night}/night)
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Check In Date</label>
                <input
                  type="date"
                  value={formData.check_in_date}
                  onChange={(e) =>
                    setFormData({ ...formData, check_in_date: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Check Out Date</label>
                <input
                  type="date"
                  value={formData.check_out_date}
                  onChange={(e) =>
                    setFormData({ ...formData, check_out_date: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Number of Guests</label>
                <input
                  type="number"
                  value={formData.number_of_guests}
                  onChange={(e) =>
                    setFormData({ ...formData, number_of_guests: parseInt(e.target.value) })
                  }
                  style={styles.input}
                  required
                  min="1"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Booking Status</label>
                <select
                  value={formData.booking_status}
                  onChange={(e) =>
                    setFormData({ ...formData, booking_status: e.target.value })
                  }
                  style={styles.input}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div style={styles.modalButtons}>
                <button
                  type="submit"
                  style={styles.saveButton}
                  disabled={availabilityCheck && !availabilityCheck.available}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
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
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalTitle: {
    marginBottom: '1.5rem',
  },
  availabilityAlert: {
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  saveButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
}

export default Reservations
