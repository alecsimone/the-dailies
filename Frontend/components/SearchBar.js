import Router from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import SearchIcon from './Icons/Search';

const StyledSearchBar = styled.div`
   width: 100%;
   margin-left: 2rem;
   font-size: ${props => props.theme.bigText};
   font-weight: 700;
   display: inline-flex;
   align-items: center;
   flex-grow: 1;
   padding-right: 3rem;
   svg.searchIcon {
      cursor: pointer;
      width: ${props => props.theme.bigText};
      height: ${props => props.theme.bigText};
      ${props => props.theme.desktopBreakpoint} {
         cursor: auto;
      }
   }
   .searchForm {
      width: 100%;
      input {
         width: 100%;
         height: 4rem;
         margin: 1rem;
         padding: 0 1rem;
         transition: all 0.25s;
         margin-left: 1rem;
         background: ${props => props.theme.midBlack};
         font-size: ${props => props.theme.bigText};
         z-index: 2;
         ${props => props.theme.desktopBreakpoint} {
            opacity: 0.6;
         }
         &:focus {
            opacity: 1;
         }
      }
      &.hidden {
         @media screen and (max-width: ${props => props.theme.desktopBPWidth}) {
            input {
               max-width: 0;
               min-width: 0;
               padding: 0;
               overflow: hidden;
            }
         }
      }
   }
`;

const SearchBar = ({ showSearch, setShowSearch, search }) => {
   const [searchTerm, setSearchTerm] = useState(search || '');

   return (
      <StyledSearchBar className="searchBar">
         <SearchIcon
            onClick={() => {
               if (setShowSearch != null) {
                  setShowSearch(!showSearch);
               }
            }}
         />
         <form
            className={
               showSearch == true || showSearch == null
                  ? 'searchForm show'
                  : 'searchForm hidden'
            }
            onSubmit={e => {
               e.preventDefault();
               if (setShowSearch != null) {
                  setShowSearch(false);
               }
               Router.push({
                  pathname: '/search',
                  query: {
                     s: searchTerm
                  }
               });
               if (setShowSearch != null) {
                  // We only want to reset the search term if we're searching in the header. The header provides the setShowSearch function, so this is a proxy test for that. It also feels likely that any situation where we want to clear the search bar after searching will also be a situation in which the search bar is toggleable, and thus this function will be provided.
                  setSearchTerm('');
               }
            }}
         >
            <input
               type="text"
               placeholder="Search"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
            />
         </form>
      </StyledSearchBar>
   );
};
export default SearchBar;
