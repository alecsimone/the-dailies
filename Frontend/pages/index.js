import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import ErrorMessage from '../components/ErrorMessage';
import LoadingRing from '../components/LoadingRing';
import Things from '../components/Archives/Things';
import MyThings from '../components/Archives/MyThings';
import LoadMoreButton from '../components/LoadMoreButton';
import { useInfiniteScroll, ALL_THINGS_QUERY } from '../lib/ThingHandling';
import { fullSizedLoadMoreButton } from '../styles/styleFragments';

const StyledHomepage = styled.section`
   display: flex;
   position: relative;
   height: 100%;
   .content {
      width: 75%;
      max-height: 100%;
      flex-grow: 1;
      padding: 2rem 0;
      overflow: hidden;
      ${props => props.theme.scroll};
      .things .thingCard {
         margin: 0 auto 4rem;
         .thingCard {
            margin: 2rem 0;
         }
      }
      ${props => props.theme.desktopBreakpoint} {
         padding: 2rem;
      }
      ${fullSizedLoadMoreButton}
   }
   .sidebar {
      width: 25%;
      display: none;
      p.emptyThings {
         padding: 0 2rem;
      }
      .list .regularThingCard {
         margin: 0;
      }
      ${props => props.theme.desktopBreakpoint} {
         max-height: 100%;
         display: block;
         background: ${props => props.theme.midBlack};
         overflow: hidden;
         ${props => props.theme.scroll};
      }
   }
`;

const Home = () => {
   const { data, loading, error, fetchMore, client } = useQuery(
      ALL_THINGS_QUERY,
      {
         ssr: false
      }
   );

   const {
      scrollerRef,
      cursorRef,
      isFetchingMore,
      noMoreToFetchRef,
      fetchMoreHandler
   } = useInfiniteScroll(fetchMore, '.things', 'allThings', client);

   let content;
   if (error) {
      content = <ErrorMessage error={error} />;
   } else if (data) {
      content = (
         <Things
            things={data.allThings}
            cardSize="regular"
            displayType="list"
         />
      );
      if (data.allThings && data.allThings.length > 0) {
         const lastThing = data.allThings[data.allThings.length - 1];
         cursorRef.current = lastThing.createdAt;
      }
   } else if (loading) {
      content = <LoadingRing />;
   }
   return (
      <StyledHomepage className="homepage">
         <div className="content" ref={scrollerRef}>
            {content}
            {data && (
               <LoadMoreButton
                  loading={loading || isFetchingMore}
                  noMore={noMoreToFetchRef.current}
                  fetchMore={fetchMoreHandler}
               />
            )}
         </div>
         <div className="sidebar">
            <MyThings scrollingSelector=".sidebar" borderSide="left" />
         </div>
      </StyledHomepage>
   );
};

export default Home;
