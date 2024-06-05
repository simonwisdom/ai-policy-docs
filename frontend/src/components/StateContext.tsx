import React, { createContext, useContext, useState } from 'react';

const DOCUMENT_TYPES = ['Rule', 'Proposed Rule', 'Notice', 'Presidential Document'];

const StateContext = createContext(null);

export const StateProvider = ({ children }) => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string | null>(null);
  const [searchApplied, setSearchApplied] = useState(false);
  const [isOpenComments, setIsOpenComments] = useState(false);
  const [isPopular, setIsPopular] = useState(true);

  return (
    <StateContext.Provider value={{
      activeTypeFilter, setActiveTypeFilter,
      selectedAgency, setSelectedAgency,
      searchText, setSearchText,
      searchApplied, setSearchApplied,
      isOpenComments, setIsOpenComments,
      isPopular, setIsPopular,
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
