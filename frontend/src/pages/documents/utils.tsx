import { CrudFilters } from '@refinedev/core';

type SetFilters = (filters: CrudFilters, behavior?: 'merge' | 'replace') => void;
type SetCurrent = (page: number) => void;

export const buildFilters = (
  searchText: string | null,
  selectedAgency: string | null,
  activeTypeFilter: string | null,
  isOpenComments: boolean,
  isPopular: boolean
): CrudFilters => {
  const filters: CrudFilters = [];

  if (searchText) {
    filters.push({
      field: 'search_query',
      operator: 'contains',
      value: searchText,
    });
  }

  if (selectedAgency) {
    filters.push({
      field: 'agency_names',
      operator: 'contains',
      value: selectedAgency,
    });
  }

  if (activeTypeFilter && activeTypeFilter !== 'Popular' && activeTypeFilter !== 'Open Comments') {
    filters.push({
      field: 'type',
      operator: 'eq',
      value: activeTypeFilter,
    });
  }

  if (isOpenComments) {
    filters.push({
      field: 'comments_close_on',
      operator: 'gt',
      value: new Date().toISOString().split('T')[0],
    });
  }

  if (isPopular) {
    filters.push({
      field: 'page_views_count',
      operator: 'gte',
      value: 3000,
    });
  }

  console.log('Built filters:', filters);
  return filters;
};

export const handleAgencyFilterChange = (
  agency: string | null,
  setSelectedAgency: (agency: string | null) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
  searchText: string | null,
  activeTypeFilter: string | null,
  isOpenComments: boolean,
  isPopular: boolean
): void => {
  setSelectedAgency(agency);
  const filters = buildFilters(searchText, agency, activeTypeFilter, isOpenComments, isPopular);
  console.log('Applying filters in handleAgencyFilterChange:', filters);
  setFilters(filters, 'merge');
  setCurrent(1);
};


export const handleTypeFilterChange = (
  type: string | null,
  setActiveTypeFilter: (type: string | null) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
  searchText: string | null,
  selectedAgency: string | null,
  isOpenComments: boolean,
  isPopular: boolean
): void => {
  setActiveTypeFilter(type);
  const filters = buildFilters(searchText, selectedAgency, type, isOpenComments, isPopular);
  console.log('Applying filters in handleTypeFilterChange:', filters);
  setFilters(filters, type ? 'merge' : 'replace');
  setCurrent(1);
};

const handleIsPopularChange = (checked: boolean) => {
  setIsPopular(checked);
  const updatedFilters = buildFilters(searchText, selectedAgency, activeTypeFilter, isOpenComments, checked);
  setFilters(updatedFilters, 'merge');
  setCurrent(1);
};

export const handleClearFilters = (
  setActiveTypeFilter: (type: string | null) => void,
  setSelectedAgency: (agency: string | null) => void,
  setSearchText: (searchText: string) => void,
  setSearchApplied: (applied: boolean) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
  setIsOpenComments: (isOpenComments: boolean) => void,
  setIsPopular: (isPopular: boolean) => void
): void => {
  setActiveTypeFilter(null);
  setSelectedAgency(null);
  setSearchText("");
  setSearchApplied(false);
  setIsOpenComments(false);
  setIsPopular(false);

  console.log('Clearing filters');
  setFilters([], 'replace');
  setCurrent(1);
};

export const handleSearch = (
  searchText: string,
  setSearchText: (searchText: string) => void,
  setSearchApplied: (applied: boolean) => void,
  setFilters: SetFilters,
  setCurrent: SetCurrent,
  activeTypeFilter: string | null,
  isOpenComments: boolean,
  isPopular: boolean,
  selectedAgency: string | null
): void => {
  // console.log('Performing search with text:', searchText);
  setSearchText(searchText);
  const isSearchApplied = !!searchText;
  // console.log('Setting searchApplied to:', isSearchApplied);
  setSearchApplied(isSearchApplied);
  const filters = buildFilters(searchText, selectedAgency, activeTypeFilter, isOpenComments, isPopular);
  console.log('Applying filters in handleSearch:', filters);
  setFilters(filters, 'merge');
  setCurrent(1);
};


export const handleSetDocumentFilter = async (
  documentNumbers: number[],
  setFilters: (filters: any[], mode: string) => void,
  setCurrent: (page: number) => void,
): Promise<void> => {
  const backendUrl = import.meta.env.MODE === 'production'
    ? `${import.meta.env.VITE_BACKEND_URL_PROD}/api/set_document_filter`
    : `${import.meta.env.VITE_BACKEND_URL_DEV}/api/set_document_filter`;

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentNumbers }),
    });

    if (response.ok) {
      console.log('Setting document filter successfully');
      setFilters([], 'replace');
      setCurrent(1);
    } else {
      const errorText = await response.text();
      console.error('Failed to set document filter:', errorText);
    }
  } catch (error) {
    console.error('Error setting document filter:', error);
  }
};

export const handleRemoveDocumentFilter = (
  setFilters: SetFilters,
  setCurrent: SetCurrent,
): void => {
  console.log('Removing document filter');
  setFilters(
    (prevFilters) => prevFilters.filter((filter) => filter.field !== 'document_number'),
    'replace'
  );
  setCurrent(1);
};
