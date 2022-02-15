import gql from 'graphql-tag';
import styled, { ThemeContext } from 'styled-components';
import { useContext } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { fullThingFields } from '../lib/CardInterfaces';
import ErrorMessage from './ErrorMessage';
import LoadingRing from './LoadingRing';
import Things from './Archives/Things';
import { perPage } from '../config';
import { useInfiniteScroll } from '../lib/ThingHandling';
import LoadMoreButton from './LoadMoreButton';
import { fullSizedLoadMoreButton } from '../styles/styleFragments';
import PlaceholderThings from './PlaceholderThings';
import useQueryAndStoreIt from '../stuffStore/useQueryAndStoreIt';

const StyledSearchResults = styled.section`
   ${fullSizedLoadMoreButton}
`;

const SEARCH_QUERY = gql`
   query SEARCH_QUERY($string: String!, $isTitleOnly: Boolean, $cursor: String, $count: Int) {
      search(string: $string, isTitleOnly: $isTitleOnly, cursor: $cursor, count: $count) {
         ${fullThingFields}
      }
   }
`;
export { SEARCH_QUERY };

const searchQueryCount = 12;

const calculateRelevancyScore = (thing, string) => {
   let score = 1;
   let words = false;
   if (string != null && string.includes(' ')) {
      words = string.split(' ');
   }

   thing.partOfTags.forEach(tag => {
      if (tag.title != null && tag.title.includes(string)) {
         score += 3 * string.length;
      }
      if (words) {
         words.forEach(word => {
            if (tag.title != null && tag.title.includes(word)) {
               score += 1;
            }
         });
      }
   });

   thing.comments.forEach(comment => {
      if (comment.content != null && comment.content.includes(string)) {
         score += 3 * string.length;
      }
      if (words) {
         words.forEach(word => {
            if (comment.content != null && comment.content.includes(word)) {
               score += 1;
            }
         });
      }
   });

   if (thing.summary != null && thing.summary.includes(string)) {
      score += 6 * string.length;
   }
   if (words) {
      words.forEach(word => {
         if (thing.summary != null && thing.summary.includes(word)) {
            score += 3;
         }
      });
   }

   thing.content.forEach(content => {
      if (content.content != null && content.content.includes(string)) {
         score += 6 * string.length;
      }
      if (words) {
         words.forEach(word => {
            if (content.content != null && content.content.includes(word)) {
               score += 2;
            }
         });
      }
      if (content.comments != null) {
         content.comments.forEach(comment => {
            if (comment.comment != null && comment.comment.includes(string)) {
               score += 3 * string.length;
            }
            if (words) {
               words.forEach(word => {
                  if (
                     comment.comment != null &&
                     comment.comment.includes(word)
                  ) {
                     score += 2;
                  }
               });
            }
         });
      }
   });

   thing.copiedInContent.forEach(content => {
      if (content.content != null && content.content.includes(string)) {
         score += 6 * string.length;
      }
      if (words) {
         words.forEach(word => {
            if (content.content != null && content.content.includes(word)) {
               score += 2;
            }
         });
      }
      if (content.comments != null) {
         content.comments.forEach(comment => {
            if (comment.comment != null && comment.comment.includes(string)) {
               score += 3 * string.length;
            }
            if (words) {
               words.forEach(word => {
                  if (
                     comment.comment != null &&
                     comment.comment.includes(word)
                  ) {
                     score += 2;
                  }
               });
            }
         });
      }
   });

   if (thing.title != null && thing.title.includes(string)) {
      score *= 10;
   }
   if (words) {
      words.forEach(word => {
         if (thing.title != null && thing.title.includes(word)) {
            score *= 2;
         }
      });
   }

   return score;
};

const sortThingsByRelevancy = (things, string) => {
   const sortedThings = [...things];
   sortedThings.sort((a, b) => {
      if (
         calculateRelevancyScore(b, string) ===
         calculateRelevancyScore(a, string)
      ) {
         // if they're equal, put the one with the lower ID first
         if (a.id > b.id) return 1;
         return -1;
      }
      return (
         calculateRelevancyScore(b, string) - calculateRelevancyScore(a, string)
      );
   });
   return sortedThings;
};
export { sortThingsByRelevancy };

const SearchResults = ({ string }) => {
   const { loading, error, data, fetchMore } = useQueryAndStoreIt(
      SEARCH_QUERY,
      {
         variables: {
            string,
            count: searchQueryCount
         }
      }
   );

   const {
      scrollerRef,
      cursorRef,
      isFetchingMore,
      noMoreToFetchRef,
      fetchMoreHandler
   } = useInfiniteScroll(fetchMore, '.things', 'search');

   const { desktopBPWidthRaw } = useContext(ThemeContext);

   if (process.browser) {
      if (window.innerWidth < desktopBPWidthRaw) {
         scrollerRef.current = document.querySelector('.threeColumns');
      } else {
         scrollerRef.current = document.querySelector('.mainSection');
      }
   }

   const displayProps = {
      cardSize: 'regular'
   };

   let content;
   if (error) {
      content = <ErrorMessage error={error} />;
   }
   if (data && data.search != null) {
      if (data.search.length > 0) {
         const sortedThings = sortThingsByRelevancy(data.search, string);

         const lastThing = sortedThings[sortedThings.length - 1];
         const newCursor = `${calculateRelevancyScore(lastThing, string)}_ID_${
            lastThing.id
         }`;
         cursorRef.current = newCursor;

         content = (
            <Things
               things={sortedThings}
               displayType="list"
               scrollingParentSelector=".mainSection"
               perPage={perPage}
               {...displayProps}
               hideConnections
            />
         );
      } else {
         content = <div>No things found.</div>;
      }
   }
   if (loading) {
      content = (
         <PlaceholderThings count={searchQueryCount} {...displayProps} />
      );
   }

   return (
      <StyledSearchResults>
         <h3 className="searchHeader">Results for "{string}"</h3>
         {content}
         {data && (
            <LoadMoreButton
               loading={loading || isFetchingMore}
               noMore={noMoreToFetchRef.current}
               fetchMore={fetchMoreHandler}
            />
         )}
      </StyledSearchResults>
   );
};

export default SearchResults;
