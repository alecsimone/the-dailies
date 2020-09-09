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
import { perPage } from '../config';

const SEARCH_QUERY = gql`
   query SEARCH_QUERY($string: String!, $isTitleOnly: Boolean) {
      search(string: $string, isTitleOnly: $isTitleOnly) {
         ${smallThingCardFields}
      }
   }
`;
export { SEARCH_QUERY };

const StyledSearchResults = styled.div`
   position: relative;
   padding: 2rem;
   h3 {
      margin-top: 0;
   }
`;

const sortThingsByRelevancy = (things, string) => {
   things.sort((a, b) => {
      let aScore = 1;
      let bScore = 1;

      const aString = JSON.stringify(a);
      const bString = JSON.stringify(b);

      // If the search string is multiple words, count the occurances of each one
      if (string.includes(' ')) {
         const words = string.split(' ');
         words.forEach(word => {
            // Search each word
            const wordSearchString = new RegExp(word, 'gim');
            // within the post data
            const aMatches = aString.match(wordSearchString);
            const bMatches = bString.match(wordSearchString);
            // And tally up the matches
            aScore += aMatches.length;
            bScore += bMatches.length;
         });
      }

      // Count the occurances of the search string in its entirety
      const searchString = new RegExp(string, 'gim');

      const aOccurances = aString.match(searchString);
      const bOccurances = bString.match(searchString);

      // This time we're multiplying by the occurances of the whole string
      aScore *= aOccurances.length;
      bScore *= bOccurances.length;

      // And then if the title includes the whole string, it gets a 5x bonus
      if (a.title.includes(string)) {
         aScore *= 5;
      }
      if (b.title.includes(string)) {
         bScore *= 5;
      }

      return bScore - aScore;
   });
   return things;
};
export { sortThingsByRelevancy };

const search = ({ query: { s: string } }) => {
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
      if (data.search.length > 0) {
         const sortedThings = sortThingsByRelevancy(data.search, string);
         content = (
            <Things
               things={sortedThings}
               cardSize="regular"
               displayType="grid"
               scrollingParentSelector=".mainSection"
               perPage={perPage}
            />
         );
      } else {
         content = <div>No things found.</div>;
      }
   }
   if (loading) {
      content = <LoadingRing />;
   }
   return (
      <StyledSearchResults>
         <h3 className="searchHeader">Results for "{string}"</h3>
         {content}
      </StyledSearchResults>
   );
};
search.getInitialProps = async ctx => ({ query: ctx.query });
search.propTypes = {
   query: PropTypes.shape({
      s: PropTypes.string
   })
};

export default search;
