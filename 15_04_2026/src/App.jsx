import { useEffect, useMemo, useState } from 'react'
import './App.css'
import SearchForm from './components/SearchForm'
import AddUser from './components/AddUser'
import ResultTable from './components/ResultTable'

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

function App() {
  const [keyword, setKeyword] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [pageSize, setPageSize] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchUsers() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Không thể tải danh sách người dùng.')
        }

        const data = await response.json()
        setUsers(data)
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
    return () => controller.abort()
  }, [])

  const filteredUsers = useMemo(() => {
    const kw = keyword.trim().toLowerCase()

    if (!kw) {
      return users
    }

    return users.filter((user) => {
      return (
        user.name.toLowerCase().includes(kw) ||
        user.username.toLowerCase().includes(kw) ||
        user.email.toLowerCase().includes(kw)
      )
    })
  }, [keyword, users])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredUsers.slice(start, start + pageSize)
  }, [filteredUsers, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [keyword, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  function upsertUser(userData) {
    if (editingUser) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                ...userData,
              }
            : user,
        ),
      )
      setEditingUser(null)
      return
    }

    const nextId = users.reduce((maxId, user) => Math.max(maxId, user.id), 0) + 1

    setUsers((prevUsers) => [
      {
        id: nextId,
        ...userData,
      },
      ...prevUsers,
    ])
  }

  function removeUser(userId) {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))

    if (editingUser?.id === userId) {
      setEditingUser(null)
    }
  }

  return (
    <main className="page">
      <section className="panel">
        <header className="panel-header">
          <h1>Quản lý người dùng</h1>
        </header>

        <SearchForm value={keyword} onChangeValue={setKeyword} />

        <AddUser
          key={editingUser?.id ?? 'new'}
          editingUser={editingUser}
          onSubmit={upsertUser}
          onCancelEdit={() => setEditingUser(null)}
        />

        <ResultTable
          users={paginatedUsers}
          totalItems={filteredUsers.length}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          onEdit={setEditingUser}
          onDelete={removeUser}
        />
      </section>
    </main>
  )
}

export default App
