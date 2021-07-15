import gql from 'graphql-tag';
import styled, { ThemeContext } from 'styled-components';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Masonry from 'react-masonry-css';
import { useContext, useState, useRef, useEffect } from 'react';
import { MemberContext } from '../components/Account/MemberProvider';
import { MY_THINGS_QUERY } from '../components/Archives/MyThings';
import LoadingRing from '../components/LoadingRing';
import SmallThingCard from '../components/ThingCards/SmallThingCard';
import { fullMemberFields, thingCardFields } from '../lib/CardInterfaces';

const MY_BIG_THINGS_QUERY = gql`
   query MY_THINGS_QUERY($cursor: String) {
      myThings(cursor: $cursor) {
         ${thingCardFields}
      }
   }
`;

const STORE_ORGANIZE_STATE_MUTATION = gql`
   mutation STORE_ORGANIZE_STATE_MUTATION($state: String!) {
      storeOrganizeState(state: $state) {
         ${fullMemberFields}
      }
   }
`;

const StyledOrganizePage = styled.section`
   padding: 2rem;
   .filterManagement {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      input.filter {
         width: 40%;
         font-size: ${props => props.theme.smallText};
      }
      button {
         font-size: ${props => props.theme.smallText};
         padding: 0.5rem;
         opacity: 0.8;
         margin-left: 2rem;
         &:hover {
            opacity: 1;
         }
      }
   }
   .tagGroup {
      .header {
         display: flex;
         align-items: center;
         justify-content: space-between;
         button {
            padding: 0.5rem 1rem;
            font-size: ${props => props.theme.smallText};
            border-radius: 6px;
         }
      }
   }
   .masonryContainer {
      display: flex;
      width: auto;
      margin-left: -2rem;
      .column {
         padding-left: 2rem;
      }
      .cardWrapper {
         margin-bottom: 2rem;
         background: ${props => props.theme.midBlack};
         .hider {
            font-size: ${props => props.theme.miniText};
            padding: 1rem;
            text-align: right;
            button {
               opacity: 0.6;
               padding: 0.5rem;
               &:hover {
                  opacity: 1;
               }
            }
         }
      }
      .smallThingCard {
         max-width: none;
         opacity: 1;
      }
   }
   button.more {
      font-size: ${props => props.theme.bigText};
      padding: 0.5rem 1rem;
      display: block;
      margin: 3rem auto;
   }
`;

const makeValuesStringFromObject = object => {
   const keys = Object.keys(object);
   let valuesString = '';
   keys.forEach(key => {
      let value = object[key];
      if (typeof value === 'object' && value !== null) {
         valuesString += makeValuesStringFromObject(value);
      } else if (value != null) {
         if (!isNaN(value)) {
            value = value.toString();
         }
         valuesString += value.toLowerCase();
      }
   });
   return valuesString;
};

const Organize = () => {
   const { me, loading: loadingMe } = useContext(MemberContext);
   let myID;
   if (me && me.id) {
      myID = me.id;
   }

   const {
      mobileBPWidthRaw,
      desktopBPWidthRaw,
      bigScreenBPWidthRaw,
      massiveScreenBPWidthRaw
   } = useContext(ThemeContext);

   const defaultState = {
      filterString: '',
      hiddenThings: [],
      groupByTag: false,
      hiddenTags: [],
      userGroups: []
   };
   let initialState;
   if (me && me.organizePageState != null) {
      initialState = me.organizePageState;
   } else {
      initialState = defaultState;
   }

   const [state, setState] = useState(initialState);

   const setStateHandler = async (property, value) => {
      setState({
         ...state,
         [property]: value
      });
   };

   const [storeState] = useMutation(STORE_ORGANIZE_STATE_MUTATION);

   useEffect(() => {
      if (loadingMe) return;
      const jsonifiedState = JSON.stringify(state);
      if (me.organizePageState === jsonifiedState || state == null) return;
      storeState({
         variables: {
            state: jsonifiedState
         },
         context: {
            debounceKey: myID
         }
      });
   }, [loadingMe, me, myID, state, storeState]);

   useEffect(() => {
      if (!loadingMe && me != null && me.organizePageState != null) {
         setState(JSON.parse(me.organizePageState));
      }
   }, [loadingMe, me]);

   const { data, loading, error, fetchMore } = useQuery(MY_BIG_THINGS_QUERY, {
      ssr: false,
      skip: me == null && !loadingMe
   });

   const [isFetchingMore, setIsFetchingMore] = useState(false);
   const [noMoreToFetch, setNoMoreToFetch] = useState(false);
   const cursorRef = useRef(null);

   if (loadingMe || state == null) return <LoadingRing />;

   const {
      filterString,
      hiddenThings,
      groupByTag,
      hiddenTags,
      userGroups
   } = state;

   const fetchMoreHandler = () => {
      if (isFetchingMore || noMoreToFetch) return;
      setIsFetchingMore(true);

      fetchMore({
         variables: {
            cursor: cursorRef.current
         },
         updateQuery: (prev, { fetchMoreResult }) => {
            setIsFetchingMore(false);

            if (!fetchMoreResult) return prev;
            if (!prev) return fetchMoreResult;

            if (
               fetchMoreResult.myThings &&
               fetchMoreResult.myThings.length === 0
            ) {
               setNoMoreToFetch(true);
            }

            return {
               myThings: [...prev.myThings, ...fetchMoreResult.myThings]
            };
         }
      });
   };

   const makeHideableCardFromThing = thing => (
      <div className="cardWrapper">
         <SmallThingCard data={thing} key={thing.id} borderSide="top" />
         <div className="hider">
            <button
               onClick={() => {
                  if (hiddenThings.includes(thing.id)) {
                     const newHiddenThings = hiddenThings.filter(
                        id => id !== thing.id
                     );
                     setStateHandler('hiddenThings', newHiddenThings);
                  } else {
                     setStateHandler('hiddenThings', [
                        ...hiddenThings,
                        thing.id
                     ]);
                  }
               }}
            >
               hide
            </button>
         </div>
      </div>
   );

   let content;
   if (data) {
      const { myThings } = data;
      myThings.sort((a, b) => {
         const aDate = new Date(a.updatedAt);
         const bDate = new Date(b.updatedAt);

         const aTimestamp = aDate.getTime();
         const bTimestamp = bDate.getTime();

         return bTimestamp - aTimestamp;
      });
      const lastThing = myThings[myThings.length - 1];
      cursorRef.current = lastThing.updatedAt;

      const filteredThings = myThings.filter(thing => {
         if (hiddenThings.includes(thing.id)) return false;
         if (filterString.trim() === '') return true;

         if (
            thing.title.toLowerCase().includes(filterString.toLocaleLowerCase())
         )
            return true;
         return false;
      });
      if (groupByTag) {
         const tagsArray = [{ id: 'tagless', title: 'Tagless', things: [] }];
         filteredThings.forEach(thing => {
            if (thing.partOfTags.length === 0) {
               const indexOfTaglessObj = tagsArray.findIndex(
                  tagObj => tagObj.id === 'tagless'
               );
               tagsArray[indexOfTaglessObj].things.push(thing);
            } else {
               thing.partOfTags.forEach(tag => {
                  const indexOfTagObj = tagsArray.findIndex(
                     tagObj => tagObj.id === tag.id
                  );
                  if (indexOfTagObj === -1) {
                     tagsArray.push({
                        id: tag.id,
                        title: tag.title,
                        things: [thing]
                     });
                  } else {
                     tagsArray[indexOfTagObj].things.push(thing);
                  }
               });
            }
         });

         const filteredTagsArray = tagsArray.filter(
            tagObj => !hiddenTags.includes(tagObj.id)
         );

         const tagGroups = filteredTagsArray.map(tagObj => {
            const cards = tagObj.things.map(thing =>
               makeHideableCardFromThing(thing)
            );
            return (
               <div className="tagGroup">
                  <div className="header">
                     <h3>{tagObj.title}</h3>
                     <button
                        onClick={() =>
                           setStateHandler('hiddenTags', [
                              ...hiddenTags,
                              tagObj.id
                           ])
                        }
                     >
                        hide
                     </button>
                  </div>
                  <Masonry
                     breakpointCols={{
                        default: 1,
                        9999: 3,
                        [bigScreenBPWidthRaw]: 2,
                        [desktopBPWidthRaw]: 1
                     }}
                     className="masonryContainer"
                     columnClassName="column"
                  >
                     {cards}
                  </Masonry>
               </div>
            );
         });
         content = tagGroups;
      } else {
         const cards = filteredThings.map(thing =>
            makeHideableCardFromThing(thing)
         );
         content = (
            <Masonry
               breakpointCols={{
                  default: 1,
                  9999: 3,
                  [bigScreenBPWidthRaw]: 2,
                  [desktopBPWidthRaw]: 1
               }}
               className="masonryContainer"
               columnClassName="column"
            >
               {cards}
            </Masonry>
         );
      }
   } else if (loading) {
      content = <LoadingRing />;
   }
   return (
      <StyledOrganizePage>
         {data && (
            <div className="filterManagement">
               <input
                  className="filter"
                  type="text"
                  placeholder="Filter"
                  value={filterString}
                  onChange={e =>
                     setStateHandler('filterString', e.target.value)
                  }
               />
               <div className="buttons">
                  <button
                     onClick={() => setStateHandler('groupByTag', !groupByTag)}
                  >
                     {groupByTag ? 'ungroup by tag' : 'group by tag'}
                  </button>
                  {hiddenTags.length > 0 && (
                     <button onClick={() => setStateHandler('hiddenTags', [])}>
                        show hidden tags
                     </button>
                  )}
                  {hiddenThings.length > 0 && (
                     <button
                        onClick={() => setStateHandler('hiddenThings', [])}
                     >
                        show hidden things
                     </button>
                  )}
                  {JSON.stringify(state) !== JSON.stringify(defaultState) && (
                     <button onClick={() => setState(defaultState)}>
                        reset page
                     </button>
                  )}
               </div>
            </div>
         )}
         {content}
         {data && (
            <button className="more" onClick={fetchMoreHandler}>
               {isFetchingMore
                  ? 'Loading...'
                  : `${noMoreToFetch ? 'No More' : 'Load More'}`}
            </button>
         )}
      </StyledOrganizePage>
   );
};

export default Organize;
