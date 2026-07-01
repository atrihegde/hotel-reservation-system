import { useState, useEffect } from 'react'
import axios from 'axios'

const Rooms = () => {
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [filters, setFilters] = useState({
    room_type: '',
    min_price: '',
    max_price: '',
    capacity: '',
    availability: '',
    room_number: '',
  })

  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'standard',
    floor: 1,
    capacity: 1,
    price_per_night: '',
    status: 'available',
    description: '',
  })

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [rooms, filters])

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/rooms/')
      setRooms(response.data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...rooms]

    if (filters.room_type) {
      filtered = filtered.filter((room) => room.room_type === filters.room_type)
    }
    if (filters.min_price) {
      filtered = filtered.filter((room) => room.price_per_night >= parseFloat(filters.min_price))
    }
    if (filters.max_price) {
      filtered = filtered.filter((room) => room.price_per_night <= parseFloat(filters.max_price))
    }
    if (filters.capacity) {
      filtered = filtered.filter((room) => room.capacity >= parseInt(filters.capacity))
    }
    if (filters.availability) {
      filtered = filtered.filter((room) => room.status === filters.availability)
    }
    if (filters.room_number) {
      filtered = filtered.filter((room) =>
        room.room_number.toLowerCase().includes(filters.room_number.toLowerCase())
      )
    }

    setFilteredRooms(filtered)
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleResetFilters = () => {
    setFilters({
      room_type: '',
      min_price: '',
      max_price: '',
      capacity: '',
      availability: '',
      room_number: '',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingRoom) {
        await axios.put(`http://localhost:8000/api/rooms/${editingRoom.id}/`, formData)
      } else {
        await axios.post('http://localhost:8000/api/rooms/', formData)
      }
      setShowModal(false)
      setEditingRoom(null)
      setFormData({
        room_number: '',
        room_type: 'standard',
        floor: 1,
        capacity: 1,
        price_per_night: '',
        status: 'available',
        description: '',
      })
      fetchRooms()
    } catch (error) {
      console.error('Error saving room:', error)
      alert('Error saving room')
    }
  }

  const handleEdit = (room) => {
    setEditingRoom(room)
    setFormData(room)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await axios.delete(`http://localhost:8000/api/rooms/${id}/`)
        fetchRooms()
      } catch (error) {
        console.error('Error deleting room:', error)
        alert('Error deleting room')
      }
    }
  }

  const handleAdd = () => {
    setEditingRoom(null)
    setFormData({
      room_number: '',
      room_type: 'standard',
      floor: 1,
      capacity: 1,
      price_per_night: '',
      status: 'available',
      description: '',
    })
    setShowModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#28a745'
      case 'occupied':
        return '#dc3545'
      case 'maintenance':
        return '#ffc107'
      default:
        return '#6c757d'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Room Management</h1>
        <button onClick={handleAdd} style={styles.addButton}>
          Add Room
        </button>
      </div>

      <div style={styles.filters}>
        <h3>Search & Filter</h3>
        <div style={styles.filterGrid}>
          <input
            type="text"
            name="room_number"
            placeholder="Room Number"
            value={filters.room_number}
            onChange={handleFilterChange}
            style={styles.filterInput}
          />
          <select
            name="room_type"
            value={filters.room_type}
            onChange={handleFilterChange}
            style={styles.filterInput}
          >
            <option value="">All Types</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
          </select>
          <input
            type="number"
            name="min_price"
            placeholder="Min Price"
            value={filters.min_price}
            onChange={handleFilterChange}
            style={styles.filterInput}
          />
          <input
            type="number"
            name="max_price"
            placeholder="Max Price"
            value={filters.max_price}
            onChange={handleFilterChange}
            style={styles.filterInput}
          />
          <input
            type="number"
            name="capacity"
            placeholder="Min Capacity"
            value={filters.capacity}
            onChange={handleFilterChange}
            style={styles.filterInput}
          />
          <select
            name="availability"
            value={filters.availability}
            onChange={handleFilterChange}
            style={styles.filterInput}
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button onClick={handleResetFilters} style={styles.resetButton}>
            Reset
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Room Number</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Floor</th>
              <th style={styles.th}>Capacity</th>
              <th style={styles.th}>Price/Night</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room.id}>
                <td style={styles.td}>{room.room_number}</td>
                <td style={styles.td}>{room.room_type}</td>
                <td style={styles.td}>{room.floor}</td>
                <td style={styles.td}>{room.capacity}</td>
                <td style={styles.td}>${room.price_per_night}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(room.status),
                    }}
                  >
                    {room.status}
                  </span>
                </td>
                <td style={styles.td}>{room.description || '-'}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleEdit(room)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
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
              {editingRoom ? 'Edit Room' : 'Add Room'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Room Number</label>
                <input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) =>
                    setFormData({ ...formData, room_number: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Room Type</label>
                <select
                  value={formData.room_type}
                  onChange={(e) =>
                    setFormData({ ...formData, room_type: e.target.value })
                  }
                  style={styles.input}
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Floor</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: parseInt(e.target.value) })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Price per Night</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_per_night}
                  onChange={(e) =>
                    setFormData({ ...formData, price_per_night: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  style={styles.input}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  style={styles.textarea}
                  rows={3}
                />
              </div>
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.saveButton}>
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
  filters: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  filterInput: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  resetButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
  deleteButton: {
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
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical',
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

export default Rooms
