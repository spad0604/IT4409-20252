import { useState } from 'react'

const INITIAL_FORM = {
  name: '',
  username: '',
  email: '',
  street: '',
  suite: '',
  city: '',
  phone: '',
}

function createFormFromUser(user) {
  if (!user) {
    return INITIAL_FORM
  }

  return {
    name: user.name ?? '',
    username: user.username ?? '',
    email: user.email ?? '',
    street: user.address?.street ?? '',
    suite: user.address?.suite ?? '',
    city: user.address?.city ?? '',
    phone: user.phone ?? '',
  }
}

function AddUser({ editingUser, onSubmit, onCancelEdit }) {
  const [form, setForm] = useState(() => createFormFromUser(editingUser))

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.name.trim() || !form.username.trim() || !form.email.trim()) {
      return
    }

    onSubmit({
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      address: {
        street: form.street.trim(),
        suite: form.suite.trim(),
        city: form.city.trim(),
      },
      phone: form.phone.trim(),
    })

    if (!editingUser) {
      setForm(INITIAL_FORM)
    }
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h2>{editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</h2>

      <div className="grid-fields">
        <label>
          Họ tên
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Username
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Số điện thoại
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </label>

        <label>
          Street
          <input
            type="text"
            name="street"
            value={form.street}
            onChange={handleChange}
          />
        </label>

        <label>
          Suite
          <input
            type="text"
            name="suite"
            value={form.suite}
            onChange={handleChange}
          />
        </label>

        <label>
          City
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit">
          {editingUser ? 'Lưu thay đổi' : 'Thêm người dùng'}
        </button>

        {editingUser && (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={onCancelEdit}
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  )
}

export default AddUser