import { CrudFilters } from '@refinedev/core';

type SetFilters = (filters: CrudFilters, behavior?: 'merge' | 'replace') => void;
type SetCurrent = (page: number) => void;

export const handleAgencyFilterChange = (
  agency: string,
  setSelectedAgency: (agency: string) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
): void => {
  setSelectedAgency(agency);
  setFilters([
    {
      field: 'agency_names',
      operator: 'eq',
      value: agency,
    },
  ], 'merge');
  setCurrent(1); // Reset pagination to the first page
};

export const handleTypeFilterChange = (
  type: string | null,
  setActiveTypeFilter: (type: string | null) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
): void => {
  setActiveTypeFilter(type);

  if (type) {
    setFilters([
      {
        field: 'type',
        operator: 'eq',
        value: type,
      },
    ], 'merge');
  } else {
    setFilters([], 'replace');
  }
  setCurrent(1);
};

export const handleClearFilters = (
  setActiveTypeFilter: (type: string | null) => void,
  setSelectedAgency: (agency: string | null) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
): void => {
  setActiveTypeFilter(null);
  setSelectedAgency(null);
  setFilters([]);
  setCurrent(1);
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
