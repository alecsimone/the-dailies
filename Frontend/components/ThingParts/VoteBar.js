import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import Link from 'next/link';
import { useContext, useState, useRef } from 'react';
import { setAlpha } from '../../styles/functions';
import { ThingContext } from '../../pages/thing';
import { MemberContext } from '../Account/MemberProvider';
import DefaultAvatar from '../Icons/DefaultAvatar';
import { ALL_THINGS_QUERY } from '../../pages/index';

const VOTE_MUTATION = gql`
   mutation VOTE_MUTATION($id: ID!, $type: String!) {
      vote(id: $id, type: $type) {
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

const VoteBar = ({ votes = [], id, type, mini }) => {
   const { me } = useContext(MemberContext);
   const [vote] = useMutation(VOTE_MUTATION, {
      refetchQueries: [{ query: ALL_THINGS_QUERY }],
      onError: err => alert(err.message)
   });
   const [voters, setVoters] = useState(votes);

   let meVotedCheck = false;
   const voterBubbles = [];
   let computedScoreCheck = 0;
   if (voters.length > 0) {
      voters.forEach(
         ({ voter: { id: voterID, displayName, avatar }, value }) => {
            if (me && voterID === me.id) {
               meVotedCheck = true;
            }
            voterBubbles.push(
               <div
                  className="voterBubble"
                  title={`${displayName}: ${value}`}
                  key={voterID}
               >
                  <Link href={{ pathname: '/member', query: { id: voterID } }}>
                     <a>
                        {avatar != null ? (
                           <img src={avatar} alt={`${displayName} vote`} />
                        ) : (
                           <DefaultAvatar />
                        )}
                     </a>
                  </Link>
               </div>
            );
            computedScoreCheck += value;
         }
      );
   }

   const [meVoted, setMeVoted] = useState(meVotedCheck);
   const [computedScore, setComputedScore] = useState(computedScoreCheck);

   // We're going to roll our own little debounce setup to prevent people from hammering the server with votes
   const [isDebouncing, setIsDebouncing] = useState(false);
   const voteCountRef = useRef(0);

   const voteRecalculator = () => {
      let newVotes;
      let newScore;
      if (meVoted) {
         newVotes = voters.filter(vote => vote.voter.id !== me.id);
         newScore = computedScore - me.rep;
      } else {
         newVotes = [
            ...voters,
            {
               __typename: 'Vote',
               id: 'newVote',
               value: me.rep,
               voter: me
            }
         ];
         newScore = computedScore + me.rep;
      }
      return [newVotes, newScore];
   };

   const voteDebouncer = async () => {
      console.log(isDebouncing);
      if (!isDebouncing) {
         console.log('Good to go');
         // If we're not debouncing, we're going to vote and update the state. First though, let's start debouncing.
         setIsDebouncing(true);
         const [newVotes, newScore] = voteRecalculator();
         setVoters(newVotes);
         setComputedScore(newScore);
         setMeVoted(!meVoted);
         await vote({
            variables: {
               id,
               type
            }
         }).catch(err => alert(err.message));

         // And then set a timeout to run a function at the end of the debounce period
         window.setTimeout(async () => {
            // If we voted an even number of times during the debounce period, they cancel out and we don't need to tell the server about them.
            const voteOddness = voteCountRef.current % 2;
            if (voteOddness === 1) {
               // If we voted an odd number, we send one vote to the server. Note that we don't want to update the state because we already did that when we received a vote during the debounce period
               await vote({
                  variables: {
                     id,
                     type
                  }
               }).catch(err => alert(err.message));
            }

            // Then we stop debouncing and reset our vote counter
            setIsDebouncing(false);
            voteCountRef.current = 0;
         }, 5000);
      } else {
         console.log('hol up a sec');
         // If we are debouncing, we're just going to track how many times we voted and change state without sending any votes to the server
         voteCountRef.current += 1;
         const [newVotes, newScore] = voteRecalculator();
         setVoters(newVotes);
         setComputedScore(newScore);
         setMeVoted(!meVoted);
      }
   };

   return (
      <StyledVoteBar className={mini ? 'votebar mini' : 'votebar'}>
         <div className="left">
            <img
               src="/logo-small.png"
               alt="Vote Button"
               role="button"
               className={meVoted ? 'voteButton full' : 'voteButton empty'}
               onClick={() => {
                  if (me == null) {
                     alert('You must be logged in to do that!');
                     return;
                  }
                  voteDebouncer();
               }}
            />
         </div>
         <div className="middle">{voterBubbles}</div>
         <div className="right">+{computedScore}</div>
      </StyledVoteBar>
   );
};
export default VoteBar;
