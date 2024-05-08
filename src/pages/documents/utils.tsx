export const handleAgencyFilterChange = (
  agency: string,
  setSelectedAgency: (agency: string) => void,
  setFilters: (filters: any[]) => void
): void => {
  setSelectedAgency(agency);
  setFilters([
    {
      field: 'agency_names',
      operator: 'contains',
      value: agency,
    },
  ]);
};

  export const handleTagFilterChange = (
    tag: string,
    setSelectedTag: (tag: string) => void,
    setFilters: (filters: any[]) => void
  ) => {
    setSelectedTag(tag);
    setFilters([
      {
        text: tag,
        value: tag,
      },
    ]);
  };