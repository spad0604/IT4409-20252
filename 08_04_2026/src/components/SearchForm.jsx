import { useState } from 'react';

function SearchForm({ onSearch, isLoading }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        placeholder="Nhập mã số sinh viên (VD: 20225126)..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Tra cứu'}
      </button>
    </form>
  );
}

export default SearchForm;