import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

const initialForm = {
  name: '',
  email: '',
  phone: '',
};

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUsers() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Khong the tai danh sach nguoi dung.');
        }

        const data = await response.json();
        setUsers(data);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Da xay ra loi khi tai du lieu.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadUsers();

    return () => controller.abort();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => user.name.toLowerCase().includes(keyword));
  }, [query, users]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name || !email || !phone) {
      setFormError('Vui long nhap day du ho ten, email va so dien thoai.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ name, email, phone }),
      });

      if (!response.ok) {
        throw new Error('Khong the them nguoi dung.');
      }

      const createdUser = await response.json();

      setUsers((currentUsers) => [
        {
          id: createdUser.id ?? Date.now(),
          name,
          email,
          phone,
        },
        ...currentUsers,
      ]);
      setForm(initialForm);
    } catch (submitError) {
      setFormError(submitError.message || 'Them nguoi dung that bai.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(`Xoa ${user.name}?`);
    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user.id);
      setError('');

      const response = await fetch(`${API_URL}/${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Khong the xoa nguoi dung.');
      }

      setUsers((currentUsers) => currentUsers.filter((item) => item.id !== user.id));
    } catch (deleteError) {
      setError(deleteError.message || 'Xoa nguoi dung that bai.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="app">
      <h1>CRUD Users</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Ho ten"
        />
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="So dien thoai"
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Dang them...' : 'Them'}
        </button>
      </form>

      {formError ? <p className="error">{formError}</p> : null}

      <input
        className="search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tim theo ten"
      />

      {error ? <p className="error">{error}</p> : null}

      {loading ? (
        <p>Dang tai du lieu...</p>
      ) : filteredUsers.length === 0 ? (
        <p>Khong co nguoi dung phu hop.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleDelete(user)}
                    disabled={deletingId === user.id}
                  >
                    {deletingId === user.id ? 'Dang xoa...' : 'Xoa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default App;
