function ResultTable({
  users,
  totalItems,
  loading,
  error,
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return <p className="table-message">Đang tải dữ liệu...</p>
  }

  if (error) {
    return <p className="table-message table-error">{error}</p>
  }

  if (!users.length) {
    return <p className="table-message">Không tìm thấy người dùng phù hợp.</p>
  }

  const startIndex = (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  function handlePageSizeChange(event) {
    onPageSizeChange(Number(event.target.value))
  }

  return (
    <div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Username</th>
              <th>Email</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  {user.address?.street}, {user.address?.suite}, {user.address?.city}
                </td>
                <td>{user.phone}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-edit" onClick={() => onEdit(user)}>
                      Sửa
                    </button>
                    <button className="btn btn-delete" onClick={() => onDelete(user.id)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-wrap">
        <div className="pagination-summary">
          Hiển thị {startIndex}-{endIndex} trên tổng {totalItems} người dùng
        </div>

        <div className="pagination-controls">
          <label htmlFor="page-size-select">Số dòng/trang</label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Trước
          </button>

          <span className="page-indicator">
            Trang {currentPage}/{totalPages}
          </span>

          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultTable