import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { thingCardFields } from '../lib/CardInterfaces';
import ErrorMessage from './ErrorMessage';
import LoadingRing from './LoadingRing';
import Things from './Archives/Things';
import { perPage } from '../config';

const SEARCH_QUERY = gql`
   query SEARCH_QUERY($string: String!, $isTitleOnly: Boolean) {
      search(string: $string, isTitleOnly: $isTitleOnly) {
         ${thingCardFields}
      }
   }
`;
export { SEARCH_QUERY };

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
      if (aOccurances != null) {
         aScore *= aOccurances.length;
      }
      if (bOccurances != null) {
         bScore *= bOccurances.length;
      }
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

const SearchResults = ({ string }) => {
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
      <section>
         <h3 className="searchHeader">Results for "{string}"</h3>
         {content}
      </section>
   );
};

export default SearchResults;
