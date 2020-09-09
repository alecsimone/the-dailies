import PropTypes from 'prop-types';
import styled from 'styled-components';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { setAlpha } from '../styles/functions';

const StyledSearchPage = styled.div`
   position: relative;
   padding: 2rem;
   h3 {
      margin-top: 0;
   }
   text-align: center;
   .searchBar {
      text-align: left;
      max-width: 80rem;
      margin: 4rem auto;
      background: ${props => setAlpha(props.theme.midBlack, 0.6)};
      padding: 3rem;
      border-radius: 6px;
      border: 3px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      .searchForm {
         input {
            height: ${props => props.theme.bigHead};
            background: none;
         }
      }
   }
`;

const search = ({ query: { s: string } }) => {
   if (string == null) {
      return (
         <StyledSearchPage>
            <SearchBar />
         </StyledSearchPage>
      );
   }
   return (
      <StyledSearchPage>
         <SearchResults string={string} />
      </StyledSearchPage>
   );
};
search.getInitialProps = async ctx => ({ query: ctx.query });
search.propTypes = {
   query: PropTypes.shape({
      s: PropTypes.string
   })
};

export default search;
