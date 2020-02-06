import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { smallThingCardFields } from '../lib/CardInterfaces';
import ErrorMessage from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import StyledPageWithSidebar from '../styles/StyledPageWithSidebar';
import Sidebar from '../components/Sidebar';
import Things from '../components/Archives/Things';

const SEARCH_QUERY = gql`
   query SEARCH_QUERY($string: String!) {
      search(string: $string) {
         ${smallThingCardFields}
      }
   }
`;

const StyledSearchResults = styled.div`
   h3 {
      margin-top: 0;
   }
`;

const search = ({ query }) => {
   const { s: string } = query;
   const { loading, error, data } = useQuery(SEARCH_QUERY, {
      variables: {
         string
      }
   });

   let content;
   if (error) {
      content = <ErrorMessage error={error} />;
   }
   if (data && data.search != null) {
      const thingsList = data.search;
      if (thingsList.length > 0) {
         thingsList.sort((a, b) => {
            let aScore = 1;
            let bScore = 1;

            const aString = JSON.stringify(a);
            const bString = JSON.stringify(b);

            if (string.includes(' ')) {
               const words = string.split(' ');
               words.forEach(word => {
                  const wordSearchString = new RegExp(word, 'gim');
                  const aMatches = aString.match(wordSearchString);
                  aScore += aMatches.length;
                  const bMatches = bString.match(wordSearchString);
                  bScore += bMatches.length;
               });
            }

            const searchString = new RegExp(string, 'gim');
            const aOccurances = aString.match(searchString);
            const bOccurances = bString.match(searchString);
            aScore *= aOccurances.length;
            bScore *= bOccurances.length;

            if (a.title.includes(string)) {
               aScore *= 5;
            }
            if (b.title.includes(string)) {
               bScore *= 5;
            }

            return bScore - aScore;
         });
         content = (
            <Things things={thingsList} cardSize="regular" displayType="grid" />
         );
      } else {
         content = <div>No things found.</div>;
      }
   }
   if (loading) {
      content = <LoadingRing />;
   }
   return (
      <StyledPageWithSidebar>
         <Sidebar />
         <StyledSearchResults className="mainSection">
            <h3 className="searchHeader">Results for "{string}"</h3>
            {content}
         </StyledSearchResults>
      </StyledPageWithSidebar>
   );
};
search.getInitialProps = async ctx => ({ query: ctx.query });
search.propTypes = {
   query: PropTypes.shape({
      s: PropTypes.string
   })
};

export default search;
