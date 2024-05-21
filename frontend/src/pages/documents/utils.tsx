import { CrudFilters } from '@refinedev/core';

type SetFilters = (filters: CrudFilters, behavior?: 'merge' | 'replace') => void;
type SetCurrent = (page: number) => void;

export const handleAgencyFilterChange = (
  agency: string,
  setSelectedAgency: (agency: string) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
  searchText: string | null
): void => {
  setSelectedAgency(agency);

  const filters: CrudFilters = [];

  if (searchText) {
    filters.push({
      field: 'search_query',
      operator: 'contains',
      value: searchText,
    });
  }

  filters.push({
    field: 'agency_names',
    operator: 'contains',
    value: agency,
  });

  setFilters(filters, 'replace');
  setCurrent(1); // Reset pagination to the first page
};


export const handleTypeFilterChange = (
  type: string | null,
  setActiveTypeFilter: (type: string | null) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
  searchText: string | null
): void => {
  setActiveTypeFilter(type);

  const filters: CrudFilters = [];

  if (searchText) {
    filters.push({
      field: 'search_query',
      operator: 'contains',
      value: searchText,
    });
  }

  if (type === 'Popular') {
    filters.push({
      field: 'page_views_count',
      operator: 'gte',
      value: 3000,
    });
  } else {
    filters.push({
      field: 'type',
      operator: 'eq',
      value: type,
    });
  }

  setFilters(filters, 'replace');
  setCurrent(1);
};

export const handleClearFilters = (
  setActiveTypeFilter: (type: string | null) => void,
  setSelectedAgency: (agency: string | null) => void,
  setSearchText: (searchText: string) => void,
  setSearchApplied: (applied: boolean) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
  initialFilterState: CrudFilters,
): void => {
  setActiveTypeFilter(null);
  setSelectedAgency(null);
  setSearchText("");
  setSearchApplied(false);

  // Clear all filters
  setFilters([], 'replace');
  
  // Apply the initial empty filter state
  setTimeout(() => {
    setFilters(initialFilterState, 'replace');
    setCurrent(1);
  }, 0);
};


export const handleTagFilterChange = (
  tag: string,
  setSelectedTag: (tag: string) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
): void => {
  setSelectedTag(tag);
  setFilters(
    [
      {
        field: 'tags',
        operator: 'eq',
        value: tag,
      },
    ],
    'replace'
  );
  setCurrent(1);
};

export const handleSearch = (
  searchText: string,
  setSearchText: (searchText: string) => void,
  setSearchApplied: (applied: boolean) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
): void => {
  setSearchText(searchText);
  setSearchApplied(!!searchText);
  setFilters(
    [
      {
        field: 'search_query',
        operator: 'contains',
        value: searchText,
      },
    ],
    'merge',
  );
  setCurrent(1);
};