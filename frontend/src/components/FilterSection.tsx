import React from 'react';
import { Input, Button, Select, Switch, Tooltip, Tag } from 'antd';
import { useStateContext } from './StateContext';
import { handleTypeFilterChange, buildFilters } from '../pages/documents/utils';
import './FilterSection.css';

const DOCUMENT_TYPES = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document'];

const FilterSection: React.FC<{
    handleSearch: () => void;
    // handleChatbotSearch: () => void;
    handleClearFilters: () => void;
    isOpenComments: boolean;
    setIsOpenComments: (isOpenComments: boolean) => void;
    isPopular: boolean;
    setIsPopular: (isPopular: boolean) => void;
    activeTypeFilter: string | null;
    setActiveTypeFilter: (type: string | null) => void;
    setFilters: (filters: any[], mode: string) => void;
    setCurrent: (page: number) => void;
    totalDocuments: number;
    handleAgencyFilterChange: () => void;
    handleRemoveDocumentFilter: () => void;
    setSearchApplied: (applied: boolean) => void;
    filters?: any[];
  }> = ({
    handleSearch,
    handleClearFilters,
    isOpenComments,
    setIsOpenComments,
    isPopular,
    setIsPopular,
    activeTypeFilter,
    setActiveTypeFilter,
    setFilters,
    setCurrent,
    totalDocuments,
    handleAgencyFilterChange,
    handleRemoveDocumentFilter,
    setSearchApplied,
    filters = [],
  }) => {
    const {
      searchText,
      setSearchText,
      selectedAgency,
      setSelectedAgency,
      searchApplied,
    } = useStateContext();
  
    const handleIsOpenCommentsChange = (checked: boolean) => {
        setIsOpenComments(checked);
        if (checked) {
          setIsPopular(false);
          setFilters(
            (prevFilters) => prevFilters.filter((filter) => filter.field !== 'page_views_count'),
            'replace'
          );
          const updatedFilters = buildFilters(searchText, selectedAgency, activeTypeFilter, checked, false);
          setFilters(updatedFilters, 'merge');
        } else {
          setFilters(
            (prevFilters) => prevFilters.filter((filter) => filter.field !== 'comments_close_on'),
            'replace'
          );
        }
        setCurrent(1);
      };
      
      const handleIsPopularChange = (checked: boolean) => {
        setIsPopular(checked);
        if (checked) {
          setIsOpenComments(false);
          setFilters(
            (prevFilters) => prevFilters.filter((filter) => filter.field !== 'comments_close_on'),
            'replace'
          );
          const updatedFilters = buildFilters(searchText, selectedAgency, activeTypeFilter, false, checked);
          setFilters(updatedFilters, 'merge');
        } else {
          setFilters(
            (prevFilters) => prevFilters.filter((filter) => filter.field !== 'page_views_count'),
            'replace'
          );
        }
        setCurrent(1);
      };

    const handleClearSearch = () => {
        // console.log('Clearing search');
        setSearchText('');
        setSearchApplied(false);
        const updatedFilters = buildFilters('', selectedAgency, activeTypeFilter, isOpenComments, isPopular);
        setFilters(updatedFilters, 'replace');
        setCurrent(1);
      };

      const handleClearAgencyFilter = () => {
        setSelectedAgency(null);
        const updatedFilters = buildFilters(searchText, null, activeTypeFilter, isOpenComments, isPopular);
        setFilters(updatedFilters, 'replace');
        setCurrent(1);
    };

    return (
        <div className="filter-section-container">
          <div className="filter-section">
            <div className="filter-row">
              <Select
                placeholder="Document Type"
                value={activeTypeFilter}
                onChange={(value) => setActiveTypeFilter(value)}
                allowClear
                className="ant-select"
                popupClassName="dropdown-custom-width"
                aria-label="Select document type"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
              <Input
                placeholder="Search..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="ant-input"
                aria-label="Search documents"
              />
              <Button onClick={handleSearch} className="filter-button" aria-label="Perform keyword search">
                Keyword Search
              </Button>
              <Tooltip title="Filter by documents with open comments">
                <div className="switch-label">
                  <Switch
                    checked={isOpenComments}
                    onChange={handleIsOpenCommentsChange}
                    className="ant-switch"
                    aria-label="Toggle open comments filter"
                  />
                  <span role="img" aria-label="comments">💬 Open for Comment</span>
                </div>
              </Tooltip>
              <Tooltip title="Filter by popular documents">
                <div className="switch-label">
                  <Switch
                    checked={isPopular}
                    onChange={handleIsPopularChange}
                    className="ant-switch"
                    aria-label="Toggle popular documents filter"
                  />
                  <span role="img" aria-label="popular">🔥 Popular Documents</span>
                </div>
              </Tooltip>
              
              <Button onClick={handleClearFilters} className="filter-button" aria-label="Clear all filters">
                Clear All Filters
              </Button>
              <div className="total-documents" aria-label={`Total documents: ${totalDocuments}`}>
                Documents: {totalDocuments}
            </div>
            </div>
          </div>
          <div className="filter-summary">
          {selectedAgency && (
              <Tag closable onClose={handleClearAgencyFilter} aria-label={`Filter by agency: ${selectedAgency}`}>
                Agency: {selectedAgency}
              </Tag>
            )}

           {searchApplied && (
            <Tag
                closable
                onClose={handleClearSearch}
                aria-label={`Search filter: ${searchText}`}
            >
                Search: {searchText}
            </Tag>
            )}

            {filters.some((filter) => filter.field === 'document_number') && (
              <Tag closable onClose={handleRemoveDocumentFilter} aria-label="Document filter applied">
                Document Filter
              </Tag>
            )}
          </div>

        </div>
      );
      
    };

export default FilterSection;
