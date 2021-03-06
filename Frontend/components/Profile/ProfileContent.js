import styled from 'styled-components';
import { useState, useEffect } from 'react';
import Router from 'next/router';
import Things from '../Archives/Things';
import MemberCard from '../MemberCard';
import { setAlpha } from '../../styles/functions';
import { perPage } from '../../config';

const StyledProfileContent = styled.div`
   position: absolute;
   top: 3rem;
   left: 3%;
   width: 94%;
   max-height: 100%;
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
   .friends {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(30rem, 35rem));
      grid-gap: 4rem;
      align-items: stretch;
   }
`;

const ProfileContent = ({ member, isMe, defaultTab }) => {
   const [selectedTab, setSelectedTab] = useState(defaultTab || 'Things');

   /* eslint-disable react-hooks/exhaustive-deps */
   // We need to make our container switch to the Things tab when we route to a new member, but eslint doesn't let you use a dependency for an effect that isn't referenced in the effect. I can't find any reason why that is or any better way of doing it, so I'm just turning off that rule for a minute.
   useEffect(() => {
      setSelectedTab(defaultTab || 'Things');
   }, [member.id, member.displayName, defaultTab]);
   /* eslint-enable */

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
      if (member.createdThings) {
         sortedThings = member.createdThings.sort((a, b) => {
            const aDate = new Date(a.createdAt);
            const bDate = new Date(b.createdAt);
            return bDate - aDate;
         });
      }
      if (sortedThings.length > 0) {
         selection = (
            <Things
               things={sortedThings}
               displayType="list"
               cardSize="regular"
               scrollingParentSelector=".content"
               perPage={perPage}
            />
         );
      } else {
         selection = <p>{`${isMe ? 'You' : 'They'} have no things.`}</p>;
      }
   } else if (selectedTab === 'Likes') {
      if (member.votes != null && member.votes.length > 0) {
         const allVotes = member.votes.map(vote => vote.onThing);
         let likedThings = allVotes.filter(vote => vote != null);
         likedThings = likedThings.sort((a, b) => {
            const aDate = new Date(a.createdAt);
            const bDate = new Date(b.createdAt);
            return bDate - aDate;
         });
         selection = (
            <Things
               things={likedThings}
               displayType="list"
               cardSize="regular"
               scrollingParentSelector=".content"
               perPage={perPage}
            />
         );
      } else if (member.votes != null && member.votes.length === 0) {
         selection = <p>You haven't liked anything yet</p>;
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
      <StyledProfileContent className="stuffWrapper">
         {selector}
         {selection}
      </StyledProfileContent>
   );
};

export default ProfileContent;
