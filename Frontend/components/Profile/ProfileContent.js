import styled from 'styled-components';
import { useState, useEffect, useRef } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import gql from 'graphql-tag';
import Things from '../Archives/Things';
import MemberCard from '../MemberCard';
import { setAlpha } from '../../styles/functions';
import { perPage } from '../../config';
import { useLazyQueryAndStoreIt } from '../../stuffStore/useQueryAndStoreIt';
import {
   commentFields,
   contentPieceFields,
   fullThingFields
} from '../../lib/CardInterfaces';
import LoadMoreButton from '../LoadMoreButton';
import { useInfiniteScroll } from '../../lib/ThingHandling';
import { fullSizedLoadMoreButton } from '../../styles/styleFragments';
import CardGenerator from '../ThingCards/CardGenerator';
import TruncCont from '../ThingParts/TruncCont';
import AuthorLink from '../ThingParts/AuthorLink';

const MORE_MEMBER_THINGS_QUERY = gql`
   query MORE_MEMBER_THINGS_QUERY($memberID: String!, $cursor: String, $count: Int) {
      moreMemberThings(memberID: $memberID, cursor: $cursor, count: $count) {
         ${fullThingFields}
      }
   }
`;

const MORE_MEMBER_VOTES_QUERY = gql`
   query MORE_MEMBER_VOTES_QUERY($memberID: String!, $cursor: String, $count: Int) {
      moreMemberVotes(memberID: $memberID, cursor: $cursor, count: $count) {
         __typename
      id
      onThing {
         ${fullThingFields}
      }
      onComment {
         ${commentFields}
      }
      onContentPiece {
         ${contentPieceFields}
      }
      value
      createdAt
      }
   }
`;

const StyledProfileContent = styled.div`
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   max-height: 100%;
   overflow: hidden;
   ${props => props.theme.scroll};
   padding: 3rem;
   .stuffSelector {
      display: flex;
      justify-content: space-between;
      border: 3px solid ${props => props.theme.lowContrastGrey};
      margin-bottom: 3rem;
      .tab {
         border-right: 3px solid ${props => props.theme.lowContrastGrey};
         display: block;
         flex-grow: 1;
         text-align: center;
         padding: 0.25rem 0;
         cursor: pointer;
         &:last-child {
            border-right: none;
         }
         &.selected {
            background: ${props => setAlpha(props.theme.lowContrastGrey, 0.4)};
            &:hover {
               background: ${props =>
                  setAlpha(props.theme.lowContrastGrey, 0.4)};
            }
         }
         &:hover {
            background: ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
         }
      }
   }
   .things > *,
   .voteElements > * {
      margin: 0 auto 2rem;
      max-width: min(1200px, calc(100% - 1rem));
      ${props => props.theme.mobileBreakpoint} {
         margin-bottom: 4rem;
      }
   }
   .things .flexibleThingCard,
   .things article,
   .voteElements .flexibleThingCard,
   .voteElements article {
      .content {
         width: 100%;
      }
   }
   .voteElements {
      .pieceCard,
      .commentCard {
         ${props => props.theme.thingColors};
         border-radius: 3px;
         padding: 1rem;
         ${props => props.theme.midScreenBreakpoint} {
            padding: 2rem;
         }
         .cardContent {
            background: ${props => props.theme.midBlack};
            border-radius: 3px;
            padding: 1rem;
            ${props => props.theme.midScreenBreakpoint} {
               padding: 2rem;
            }
         }
         .cardLink {
            padding-top: 1rem;
            font-size: ${props => props.theme.miniText};
         }
      }
      .commentCard {
         .authorBlock {
            display: inline;
            font-weight: bold;
            a.authorLink {
               color: ${props => props.theme.majorColor};
            }
         }
      }
   }
   .friends {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(30rem, 35rem));
      grid-gap: 4rem;
      align-items: stretch;
   }
   ${fullSizedLoadMoreButton}
`;

const ReadOnlyContentPieceCard = ({ pieceData }) => {
   const [expanded, setExpanded] = useState(false);

   let cardLink;
   if (pieceData.onThing) {
      cardLink = (
         <>
            From the thing{' '}
            <Link
               href={{
                  pathname: '/thing',
                  query: { id: pieceData.onThing.id, piece: pieceData.id }
               }}
            >
               <a>{pieceData.onThing.title}</a>
            </Link>
         </>
      );
   } else if (pieceData.onTag) {
      cardLink = (
         <>
            From the tag{' '}
            <Link
               href={{
                  pathname: '/tag',
                  query: { title: pieceData.onTag.title }
               }}
            >
               <a>{pieceData.onTag.title}</a>
            </Link>
         </>
      );
   } else {
      cardLink =
         "Sadly, we're not really sure where this content piece is anymore.";
   }

   return (
      <div className="pieceCard">
         <div className="cardContent">
            <TruncCont
               cont={pieceData}
               limit={280}
               truncContExpanded={expanded}
               setTruncContExpanded={setExpanded}
            />
         </div>
         <div className="cardLink">{cardLink}</div>
      </div>
   );
};

const ReadOnlyCommentCard = ({ commentData }) => {
   let cardLink;
   if (commentData.onThing != null) {
      cardLink = (
         <>
            On the thing{' '}
            <Link
               href={{
                  pathname: '/thing',
                  query: { id: commentData.onThing.id }
               }}
            >
               <a>{commentData.onThing.title}</a>
            </Link>
         </>
      );
   } else if (commentData.onContentPiece != null) {
      if (commentData.onContentPiece.onThing != null) {
         cardLink = (
            <>
               On a content piece in the thing{' '}
               <Link
                  href={{
                     pathname: '/thing',
                     query: {
                        id: commentData.onContentPiece.onThing.id,
                        piece: commentData.onContentPiece.id
                     }
                  }}
               >
                  <a>{commentData.onContentPiece.onThing.title}</a>
               </Link>
            </>
         );
      } else if (commentData.onContentPiece.onTag != null) {
         cardLink = (
            <>
               On a content piece in the tag{' '}
               <Link
                  href={{
                     pathname: '/tag',
                     query: { id: commentData.onContentPiece.onTag.title }
                  }}
               >
                  <a>{commentData.onContentPiece.onTag.title}</a>
               </Link>
            </>
         );
      } else {
         cardLink =
            "Sadly, we're not really sure where this content piece is anymore.";
      }
   } else {
      cardLink =
         "Sadly, we're not really sure where this content piece is anymore.";
   }

   return (
      <div className="commentCard">
         <div className="cardContent">
            <AuthorLink thingID={commentData.id} type="Comment" noPic />{' '}
            {commentData.comment}
         </div>
         <div className="cardLink">{cardLink}</div>
      </div>
   );
};

const ProfileContent = ({ member, isMe, defaultTab }) => {
   const [selectedTab, setSelectedTab] = useState(defaultTab || 'Things');

   /* eslint-disable react-hooks/exhaustive-deps */
   // We need to make our container switch to the Things tab when we route to a new member, but eslint doesn't let you use a dependency for an effect that isn't referenced in the effect. I can't find any reason why that is or any better way of doing it, so I'm just turning off that rule for a minute.
   useEffect(() => {
      setSelectedTab(defaultTab || 'Things');

      // We also need to reset our refs
      createdThingsRef.current = JSON.parse(
         JSON.stringify(member.createdThings)
      );
      votesRef.current = JSON.parse(JSON.stringify(member.votes));
   }, [member.id, member.displayName, defaultTab]);
   /* eslint-enable */

   const createdThingsRef = useRef(
      JSON.parse(JSON.stringify(member.createdThings))
   );

   const votesRef = useRef(JSON.parse(JSON.stringify(member.votes)));

   const [
      fetchMoreCreatedThings,
      { loading: loadingCreatedThings }
   ] = useLazyQueryAndStoreIt(MORE_MEMBER_THINGS_QUERY, {
      variables: {
         memberID: member.id,
         count: 2
      },
      onCompleted: data => {
         if (data.moreMemberThings) {
            if (data.moreMemberThings.length === 0) {
               createdThingsNoMoreToFetchRef.current = true;
               createdThingsSetNoMoreToFetch(true);
            } else {
               createdThingsRef.current = createdThingsRef.current.concat(
                  data.moreMemberThings
               );
            }
         }
         createdThingsIsFetchingMoreRef.current = false;
         createdThingsSetIsFetchingMore(false);
      }
   });

   const [fetchMoreVotes, { loading: loadingVotes }] = useLazyQueryAndStoreIt(
      MORE_MEMBER_VOTES_QUERY,
      {
         variables: {
            memberID: member.id,
            count: 2
         },
         onCompleted: data => {
            if (data.moreMemberVotes) {
               if (data.moreMemberVotes.length === 0) {
                  votesNoMoreToFetchRef.current = true;
                  votesSetNoMoreToFetch(true);
               } else {
                  votesRef.current = votesRef.current.concat(
                     data.moreMemberVotes
                  );
               }
            }
            votesIsFetchingMoreRef.current = false;
            votesSetIsFetchingMore(false);
         }
      }
   );

   const {
      scrollerRef: createdThingsScrollerRef,
      cursorRef: createdThingsCursorRef,
      isFetchingMoreRef: createdThingsIsFetchingMoreRef,
      isFetchingMore: createdThingsIsFetchingMore,
      noMoreToFetchRef: createdThingsNoMoreToFetchRef,
      setNoMoreToFetch: createdThingsSetNoMoreToFetch,
      fetchMoreHandler: createdThingsFetchMoreHandler,
      setIsFetchingMore: createdThingsSetIsFetchingMore
   } = useInfiniteScroll(fetchMoreCreatedThings, '.things', 'moreMemberThings');

   const {
      scrollerRef: votesScrollerRef,
      cursorRef: votesCursorRef,
      isFetchingMoreRef: votesIsFetchingMoreRef,
      isFetchingMore: votesIsFetchingMore,
      noMoreToFetchRef: votesNoMoreToFetchRef,
      setNoMoreToFetch: votesSetNoMoreToFetch,
      fetchMoreHandler: votesFetchMoreHandler,
      setIsFetchingMore: votesSetIsFetchingMore
   } = useInfiniteScroll(fetchMoreVotes, '.voteElements', 'moreMemberVotes');

   const selectorTabsArray = ['Things', 'Likes', 'Friends'];
   const selector = (
      <div className="stuffSelector">
         {selectorTabsArray.map(tab => (
            <div
               className={selectedTab === tab ? 'tab selected' : 'tab'}
               onClick={() => {
                  // const href = `/me?stuff=${tab}`;
                  // const as = href;
                  // Router.replace(href, as, { shallow: true });
                  // setSelectedTab(tab);
                  const query = {
                     stuff: tab
                  };
                  if (!isMe) {
                     query.id = member.id;
                  }
                  Router.push({
                     pathname: isMe ? '/me' : '/member',
                     query
                  });
               }}
            >
               {tab}
            </div>
         ))}
      </div>
   );

   let selection;
   if (selectedTab === 'Things') {
      let sortedThings = [];
      if (
         Array.isArray(createdThingsRef.current) &&
         createdThingsRef.current.length > 0
      ) {
         sortedThings = createdThingsRef.current.sort((a, b) => {
            const aDate = new Date(a.createdAt);
            const bDate = new Date(b.createdAt);
            return bDate - aDate;
         });

         createdThingsCursorRef.current =
            sortedThings[sortedThings.length - 1].createdAt;
      }
      if (sortedThings.length > 0) {
         selection = (
            <div>
               <Things
                  things={sortedThings}
                  displayType="list"
                  cardSize="regular"
                  scrollingParentSelector=".content"
                  perPage={perPage}
               />
               <LoadMoreButton
                  loading={loadingCreatedThings || createdThingsIsFetchingMore}
                  noMore={createdThingsNoMoreToFetchRef.current}
                  fetchMore={createdThingsFetchMoreHandler}
               />
            </div>
         );
      } else {
         selection = <p>{`${isMe ? 'You' : 'They'} have no things.`}</p>;
      }
   } else if (selectedTab === 'Likes') {
      if (votesRef.current != null && votesRef.current.length > 0) {
         const sortedVotes = votesRef.current.sort((a, b) => {
            const aDate = new Date(a.createdAt);
            const bDate = new Date(b.createdAt);
            return bDate - aDate;
         });

         votesCursorRef.current = sortedVotes[sortedVotes.length - 1].createdAt;

         const voteElements = votesRef.current.map(vote => {
            if (vote.onThing != null) {
               return (
                  <CardGenerator
                     id={vote.onThing.id}
                     cardType="regular"
                     borderSide="top"
                     contentType="single"
                  />
               );
            }
            if (vote.onContentPiece != null) {
               return (
                  <ReadOnlyContentPieceCard pieceData={vote.onContentPiece} />
               );
            }
            if (vote.onComment != null) {
               return <ReadOnlyCommentCard commentData={vote.onComment} />;
            }
            return null;
         });

         selection = (
            <div>
               <div className="voteElements">{voteElements}</div>
               <LoadMoreButton
                  loading={loadingVotes || votesIsFetchingMore}
                  noMore={votesNoMoreToFetchRef.current}
                  fetchMore={votesFetchMoreHandler}
               />
            </div>
         );
      } else if (votesRef.current != null && votesRef.current.length === 0) {
         selection = <p>{isMe ? 'You' : 'They'} haven't liked anything yet</p>;
      } else {
         selection = <p>Error getting your likes</p>;
      }
   } else if (selectedTab === 'Friends') {
      if (member.friends.length === 0) {
         selection = <p>{isMe ? 'You' : 'They'} have no friends.</p>;
      } else {
         const friendCards = member.friends.map(friend => (
            <MemberCard member={friend} />
         ));
         selection = <div className="friends">{friendCards}</div>;
      }
   }

   return (
      <StyledProfileContent
         className="stuffWrapper"
         ref={
            selectedTab === 'Things'
               ? createdThingsScrollerRef
               : votesScrollerRef
         }
      >
         {selector}
         {selection}
      </StyledProfileContent>
   );
};

export default ProfileContent;
