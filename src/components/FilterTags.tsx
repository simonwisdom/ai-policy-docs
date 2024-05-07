import React from 'react';
import { Tag } from 'antd';

interface FilterTagsProps {
  activeTypeFilter: string | null;
  onFilterChange: (type: string | null) => void;
  onClearFilters: () => void;
}

const FilterTags: React.FC<FilterTagsProps> = ({
  activeTypeFilter,
  onFilterChange,
  onClearFilters,
}) => {
  const handleFilterClick = (type: string) => () => onFilterChange(type);
  const handleClearClick = () => onClearFilters();

  return (
    <div className="filter-tags">
      {FILTER_TAGS.map((type: string) => (
        <Tag
          color={activeTypeFilter === type ? 'blue' : 'default'}
          onClick={handleFilterClick(type)}
          key={type}
          tabIndex={0}
          aria-label={`Filter by ${type}`}
        >
          {type}
        </Tag>
      ))}
      <Tag onClick={handleClearClick} tabIndex={0} aria-label="Clear filters">
        Clear Filter
      </Tag>
    </div>
  );
};

export default FilterTags;