import React from 'react';
import { Search, X, ChevronDown, RotateCcw } from 'lucide-react';
import './CatalogFilters.css';

/**
 * Reusable CatalogFilters component for Admin Catalog
 *
 * @param {Object} props
 * @param {string} props.searchInput - Current text in search input
 * @param {Function} props.onSearchChange - Search input change handler
 * @param {string} props.domainFilter - Selected domain
 * @param {Function} props.onDomainChange - Domain change handler
 * @param {Array<string>} props.domainOptions - List of available domains
 * @param {string} props.difficultyFilter - Selected difficulty
 * @param {Function} props.onDifficultyChange - Difficulty change handler
 * @param {Array<string>} props.difficultyOptions - List of difficulty options
 * @param {string} props.durationFilter - Selected duration
 * @param {Function} props.onDurationChange - Duration change handler
 * @param {Array<string>} props.durationOptions - List of duration options
 * @param {string} props.sortOption - Selected sort option
 * @param {Function} props.onSortChange - Sort change handler
 * @param {Array<{value: string, label: string}>} props.sortOptions - List of sort options
 * @param {boolean} props.isFilterActive - Whether any filter is applied
 * @param {Array<{id: string, label: string, onRemove: Function}>} props.activeChips - Active removable chips
 * @param {Function} props.onClearFilters - Clear all filters handler
 */
export default function CatalogFilters({
  searchInput,
  onSearchChange,
  domainFilter,
  onDomainChange,
  domainOptions = [],
  difficultyFilter,
  onDifficultyChange,
  difficultyOptions = [],
  durationFilter,
  onDurationChange,
  durationOptions = [],
  sortOption,
  onSortChange,
  sortOptions = [],
  isFilterActive,
  activeChips = [],
  onClearFilters,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && searchInput) {
      onSearchChange('');
    }
  };

  return (
    <div className="catalog-filters-wrapper" role="region" aria-label="Catalog filters">
      {/* ── Main Filter Bar ── */}
      <div className="catalog-filters-bar">
        {/* 1. Search by Project Title */}
        <div className="catalog-filter-search-box">
          <span className="catalog-search-icon" aria-hidden="true">
            <Search size={15} />
          </span>
          <input
            type="text"
            className="catalog-search-input"
            placeholder="Search by project title..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search by project title"
          />
          {searchInput && (
            <button
              type="button"
              className="catalog-search-clear-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search input"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── Dropdowns Row ── */}
        <div className="catalog-filter-dropdowns">
          {/* 2. Domain Dropdown */}
          <div className="catalog-filter-select-group">
            <select
              className="catalog-filter-select"
              value={domainFilter}
              onChange={(e) => onDomainChange(e.target.value)}
              aria-label="Filter by Domain"
            >
              {domainOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="catalog-filter-select-arrow" aria-hidden="true">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* 3. Difficulty Dropdown */}
          <div className="catalog-filter-select-group">
            <select
              className="catalog-filter-select"
              value={difficultyFilter}
              onChange={(e) => onDifficultyChange(e.target.value)}
              aria-label="Filter by Difficulty"
            >
              {difficultyOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="catalog-filter-select-arrow" aria-hidden="true">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* 4. Duration Dropdown */}
          <div className="catalog-filter-select-group">
            <select
              className="catalog-filter-select"
              value={durationFilter}
              onChange={(e) => onDurationChange(e.target.value)}
              aria-label="Filter by Duration"
            >
              {durationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="catalog-filter-select-arrow" aria-hidden="true">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* 5. Sort Dropdown */}
          <div className="catalog-filter-select-group">
            <select
              className="catalog-filter-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort Projects"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="catalog-filter-select-arrow" aria-hidden="true">
              <ChevronDown size={14} />
            </span>
          </div>

          {/* 6. Clear Filters Button (visible only when filters are active) */}
          {isFilterActive && (
            <button
              type="button"
              className="catalog-clear-btn"
              onClick={onClearFilters}
              aria-label="Clear all active filters"
            >
              <RotateCcw size={13} />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Active Filter Removable Chips ── */}
      {activeChips.length > 0 && (
        <div className="catalog-active-chips-bar" aria-label="Active filters">
          <span className="catalog-chips-label">Active filters:</span>
          {activeChips.map((chip) => (
            <span key={chip.id} className="catalog-filter-chip">
              <span>{chip.label}</span>
              <button
                type="button"
                className="catalog-chip-remove"
                onClick={chip.onRemove}
                aria-label={`Remove filter ${chip.label}`}
                title="Remove filter"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
