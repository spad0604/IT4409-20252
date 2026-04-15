function SearchForm({ value, onChangeValue }) {
  return (
    <div className="search-wrap">
      <label htmlFor="search-input">Tìm kiếm người dùng</label>
      <input
        id="search-input"
        type="text"
        placeholder="Tìm theo tên, username, email"
        value={value}
        onChange={(event) => onChangeValue(event.target.value)}
      />
    </div>
  )
}

export default SearchForm