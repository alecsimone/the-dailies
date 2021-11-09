import gql from 'graphql-tag';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import React, { useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { setAlpha } from '../../styles/functions';
import Avatar from '../Avatar';
import { ALL_THINGS_QUERY } from '../../lib/ThingHandling';
import { ModalContext } from '../ModalProvider';
import Login from '../Account/Login';
import useMe from '../Account/useMe';
import { basicMemberFields } from '../../lib/CardInterfaces';

const VOTE_MUTATION = gql`
   mutation VOTE_MUTATION($id: ID!, $type: String!, $isFreshVote: Boolean!) {
      vote(id: $id, type: $type, isFreshVote: $isFreshVote) {
         ... on Thing {
            __typename
            id
            votes {
               __typename
               id
               value
               voter {
                  __typename
                  id
                  displayName
                  rep
                  avatar
               }
            }
         }
         ... on Comment {
            __typename
            id
            votes {
               __typename
               id
               value
               voter {
                  __typename
                  id
                  displayName
                  rep
                  avatar
               }
            }
         }
         ... on ContentPiece {
            __typename
            id
            votes {
               __typename
               id
               value
               voter {
                  __typename
                  id
                  displayName
                  rep
                  avatar
               }
            }
         }
      }
   }
`;
export { VOTE_MUTATION };

const useVoteBarData = (id, thingID, type) => {
   return [];
   const propertyName = `${type}:${id}`;
   const votes = useSelector(state => {
      if (type === 'Thing') {
         return state.stuff[propertyName].votes;
      }
      if (type === 'ContentPiece') {
         const { content, copiedInContent } = state.stuff[`Thing:${thingID}`];
         const allContent = content.concat(copiedInContent);
         const thisPiece = allContent.find(piece => piece.id === id);
         return thisPiece.votes;
      }
      if (type === 'Comment') {
         // This is pretty ugly right now. On a comment, the thingID prop will actually be the ID of whatever the comment is on, so it might be a comment or it might be a content piece. We'll have to figure that out, and hopefully we don't get any content pieces with the same ID as a thing we have
         const thingMatch = state.stuff[propertyName];
         if (thingMatch != null) {
            const { comments } = thingMatch;
            if (comments != null) {
               const neededComment = comments.find(
                  comment => comment.id === id
               );
               return neededComment.votes;
            }
         } else {
            // First we need to make an array of all the thing IDs
            const allThingIDs = Object.keys(state.stuff);

            // Then we're going to check each thing until we find one with the content piece we need
            let neededContentPiece;
            allThingIDs.every(id => {
               // We use every instead of forEach so that it can be stopped once we find the contentPiece by returning false
               // First we get the content on the thing from state
               const { content } = state.stuff[id];
               if (content != null && content.length > 0) {
                  // If we find content, we check if any of it is our needed piece
                  neededContentPiece = content.find(
                     piece => piece.id === thingID
                  );
                  if (neededContentPiece != null) return false;
               }
               return true;
            });

            if (neededContentPiece != null) {
               // Then we have to find the comment we need from within the contentPiece
               const neededComment = neededContentPiece.comments?.find(
                  comment => comment.id === id
               );
               return neededComment.votes;
            }
         }
      }
      return [];
   });
   return votes;
};

const StyledVoteBar = styled.section`
   background: ${props => props.theme.midBlack};
   border-radius: 0.5rem;
   border: 1px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
   padding: 1rem 0;
   display: flex;
   align-items: center;
   > div {
      padding: 0 1rem;
   }
   .left {
      line-height: 0;
      img.voteButton {
         height: 3rem;
         width: 3rem;
         cursor: pointer;
         transition: filter 0.25s;
         &.empty {
            filter: saturate(0) brightness(0.4);
            &:hover {
               filter: saturate(0.4) brightness(0.6);
            }
         }
         &.full {
            &:hover {
               filter: saturate(0.6) brightness(0.8);
            }
         }
      }
   }
   .middle {
      flex-grow: 1;
      border: 1px solid ${props => props.theme.lowContrastGrey};
      border-top: none;
      border-bottom: none;
      line-height: 0;
      min-height: 3rem;
      .voterBubble {
         display: inline-block;
         margin: 0 0.5rem;
         &:first-child {
            margin-left: 0;
         }
         img,
         svg {
            width: 2.5rem;
            height: 2.5rem;
            margin-top: 0.25rem;
            border-radius: 100%;
         }
      }
   }
   .right {
      color: ${props => props.theme.secondaryAccent};
      font-size: ${props => props.theme.bigText};
      font-weight: 600;
   }
   &.mini {
      border: none;
      padding: calc(1rem + 6.5px) 1px;
      ${props => props.theme.bigScreenBreakpoint} {
         padding: calc(1rem + 9.5px) 1px;
      }
      .middle,
      .right {
         display: none;
      }
   }
`;

const VoteBar = ({ id, thingID, type, mini, alwaysMini }) => {
   const { loggedInUserID, memberFields } = useMe('VoteBar', basicMemberFields);

   const votes = useVoteBarData(id, thingID, type);

   const [vote] = useMutation(VOTE_MUTATION, {
      refetchQueries: [{ query: ALL_THINGS_QUERY }],
      context: {
         debounceKey: id
      }
   });
   const [voters, setVoters] = useState(votes);

   const { setContent } = useContext(ModalContext);

   let meVotedCheck = false;
   const voterBubbles = [];
   let computedScoreCheck = 0;
   if (voters.length > 0) {
      voters.forEach(
         ({ voter: { id: voterID, displayName, avatar }, value }) => {
            if (loggedInUserID && voterID === loggedInUserID) {
               meVotedCheck = true;
            }
            voterBubbles.push(
               <div
                  className="voterBubble"
                  title={`${displayName}: ${value}`}
                  key={voterID}
               >
                  <Avatar
                     id={voterID}
                     avatar={avatar}
                     displayName={displayName}
                     alt={`${displayName} vote`}
                  />
               </div>
            );
            computedScoreCheck += value;
         }
      );
   }

   const [meVoted, setMeVoted] = useState(meVotedCheck);
   const [computedScore, setComputedScore] = useState(computedScoreCheck);

   /* eslint-disable */
   // If we hav eslint on, it's going to force us to include me.id in the useEffect dependencies. This isn't actually necessary because the user ID isn't going to change. But it does break the app because sometimes me is null, but we can't check for that first in a dependency array
   useEffect(() => {
      let newScore = 0;
      let myVoteExists = false;
      votes.forEach(voteData => {
         if (loggedInUserID != null && voteData.voter.id === loggedInUserID) {
            myVoteExists = true;
         }
         newScore += voteData.value;
      });
      if (myVoteExists) {
         setMeVoted(true);
      } else {
         setMeVoted(false);
      }
      setVoters(votes);
      setComputedScore(newScore);
   }, [votes.length]);
   /* eslint-enable */

   const voteRecalculator = () => {
      let newVotes;
      let newScore;
      if (meVoted) {
         newVotes = voters.filter(vote => vote.voter.id !== loggedInUserID);
         newScore = computedScore - memberFields.rep;
      } else {
         newVotes = [
            ...voters,
            {
               __typename: 'Vote',
               id: 'newVote',
               value: memberFields.rep,
               voter: memberFields
            }
         ];
         newScore = computedScore + memberFields.rep;
      }
      return [newVotes, newScore];
   };

   const voteHandler = () => {
      const [newVotes, newScore] = voteRecalculator();
      vote({
         variables: {
            id,
            type,
            isFreshVote: !meVoted
         },
         optimisticResponse: {
            __typename: 'Mutation',
            vote: {
               __typename: type,
               id,
               votes: newVotes
            }
         }
      });
      setVoters(newVotes);
      setComputedScore(newScore);
      setMeVoted(!meVoted);
   };

   return (
      <StyledVoteBar
         className={
            (mini && (voters == null || voters.length === 0)) || alwaysMini
               ? 'votebar mini'
               : 'votebar'
         }
      >
         <div
            className="left"
            onClick={e => {
               e.stopPropagation();
               if (loggedInUserID == null) {
                  setContent(<Login redirect={false} />);
                  return;
               }
               voteHandler();
            }}
         >
            <img
               src="/logo-small.png"
               alt="Vote Button"
               role="button"
               className={meVoted ? 'voteButton full' : 'voteButton empty'}
            />
         </div>
         <div className="middle">{voterBubbles}</div>
         <div className="right">+{computedScore}</div>
      </StyledVoteBar>
   );
};
export default React.memo(VoteBar);
