import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import Link from 'next/link';
import { useContext, useState, useEffect } from 'react';
import { setAlpha } from '../../styles/functions';
import { MemberContext } from '../Account/MemberProvider';
import Avatar from '../Avatar';
import { ALL_THINGS_QUERY } from '../../lib/ThingHandling';
import { ModalContext } from '../ModalProvider';
import Login from '../Account/Login';

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
      refetchQueries: [{ query: ALL_THINGS_QUERY }]
   });
   const [voters, setVoters] = useState(votes);

   const { setContent } = useContext(ModalContext);

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
         if (me != null && voteData.voter.id === me.id) {
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
   }, [votes]);
   /* eslint-enable */

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
         },
         context: {
            debounceKey: id
         }
      });
      setVoters(newVotes);
      setComputedScore(newScore);
      setMeVoted(!meVoted);
   };

   return (
      <StyledVoteBar
         className={
            mini && (voters == null || voters.length === 0)
               ? 'votebar mini'
               : 'votebar'
         }
      >
         <div
            className="left"
            onClick={e => {
               e.stopPropagation();
               if (me == null) {
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
export default VoteBar;
