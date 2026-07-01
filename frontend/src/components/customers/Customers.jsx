import { useState, useEffect } from 'react'
import axios from 'axios'

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({
    customer_id: '',
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    govt_id_number: '',
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      searchCustomers()
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchQuery, customers])

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/customers/')
      setCustomers(response.data)
      setFilteredCustomers(response.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const searchCustomers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/customers/search/?q=${searchQuery}`
      )
      setFilteredCustomers(response.data)
    } catch (error) {
      console.error('Error searching customers:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCustomer) {
        await axios.put(
          `http://localhost:8000/api/customers/${editingCustomer.id}/`,
          formData
        )
      } else {
        await axios.post('http://localhost:8000/api/customers/', formData)
      }
      setShowModal(false)
      setEditingCustomer(null)
      setFormData({
        customer_id: '',
        full_name: '',
        email: '',
        phone_number: '',
        address: '',
        govt_id_number: '',
      })
      fetchCustomers()
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Error saving customer')
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData(customer)
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`http://localhost:8000/api/customers/${id}/`)
        fetchCustomers()
      } catch (error) {
        console.error('Error deleting customer:', error)
        alert('Error deleting customer')
      }
    }
  }

  const handleAdd = () => {
    setEditingCustomer(null)
    setFormData({
      customer_id: '',
      full_name: '',
      email: '',
      phone_number: '',
      address: '',
      govt_id_number: '',
    })
    setShowModal(true)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Customer Management</h1>
        <button onClick={handleAdd} style={styles.addButton}>
          Add Customer
        </button>
      </div>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search customers by name, email, phone, ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Customer ID</th>
              <th style={styles.th}>Full Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone Number</th>
              <th style={styles.th}>Address</th>
              <th style={styles.th}>Govt ID</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id}>
                <td style={styles.td}>{customer.customer_id}</td>
                <td style={styles.td}>{customer.full_name}</td>
                <td style={styles.td}>{customer.email}</td>
                <td style={styles.td}>{customer.phone_number}</td>
                <td style={styles.td}>{customer.address}</td>
                <td style={styles.td}>{customer.govt_id_number}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleEdit(customer)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
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
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Customer ID</label>
                <input
                  type="text"
                  value={formData.customer_id}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_id: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  style={styles.textarea}
                  rows={3}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Government ID Number</label>
                <input
                  type="text"
                  value={formData.govt_id_number}
                  onChange={(e) =>
                    setFormData({ ...formData, govt_id_number: e.target.value })
                  }
                  style={styles.input}
                  required
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
  searchContainer: {
    marginBottom: '2rem',
  },
  searchInput: {
    width: '100%',
    maxWidth: '500px',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
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

export default Customers
