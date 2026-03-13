import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch, placeholder = 'Search by subject, topic, or keyword...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar-form" id="search-bar">
      <div className="input-group input-group-lg">
        <span className="input-group-text search-icon-wrapper">
          <FaSearch />
        </span>
        <input
          type="text"
          className="form-control search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-search" type="submit">
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
