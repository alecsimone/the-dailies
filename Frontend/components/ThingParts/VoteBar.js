import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import Link from 'next/link';
import { useContext } from 'react';
import { setAlpha } from '../../styles/functions';
import { ThingContext } from '../../pages/thing';
import { MemberContext } from '../Account/MemberProvider';
import DefaultAvatar from '../Icons/DefaultAvatar';
import { ALL_THINGS_QUERY } from '../../pages';

const VOTE_MUTATION = gql`
   mutation VOTE_MUTATION($thingID: ID!) {
      vote(thingID: $thingID) {
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
`;

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
`;

const VoteBar = ({ votes, thingID }) => {
   const { me } = useContext(MemberContext);
   const [vote] = useMutation(VOTE_MUTATION, {
      refetchQueries: [{ query: ALL_THINGS_QUERY }]
   });

   let meVoted = false;
   const voters = [];
   let score = 0;
   if (votes) {
      votes.forEach(
         ({ voter: { id: voterID, displayName, avatar }, value }) => {
            if (me && voterID === me.id) {
               meVoted = true;
            }
            voters.push(
               <div className="voterBubble" title={`${displayName}: ${value}`}>
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
            score += value;
         }
      );
   }

   return (
      <StyledVoteBar className="votebar">
         <div className="left">
            <img
               src="/logo-small.png"
               alt="Vote Button"
               role="button"
               className={meVoted ? 'voteButton full' : 'voteButton empty'}
               onClick={() => {
                  if (me == null) {
                     alert('you must be logged in to do that');
                     return;
                  }
                  let newVotes;
                  if (meVoted) {
                     newVotes = votes.filter(vote => vote.voter.id !== me.id);
                  } else {
                     newVotes = [
                        ...votes,
                        {
                           __typename: 'Vote',
                           id: 'newVote',
                           value: me.rep,
                           voter: me
                        }
                     ];
                  }
                  vote({
                     variables: {
                        thingID
                     },
                     optimisticResponse: {
                        __typename: 'Mutation',
                        vote: {
                           __typename: 'Thing',
                           id: thingID,
                           votes: newVotes
                        }
                     }
                  });
               }}
            />
         </div>
         <div className="middle">{voters}</div>
         <div className="right">+{score}</div>
      </StyledVoteBar>
   );
};
export default VoteBar;
