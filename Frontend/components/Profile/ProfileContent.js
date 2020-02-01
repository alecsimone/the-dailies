import styled from 'styled-components';
import { useState, useEffect } from 'react';
import Things from '../Archives/Things';
import MemberCard from '../MemberCard';
import { setAlpha } from '../../styles/functions';

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

const ProfileContent = ({ member, isMe }) => {
   const [selectedTab, setSelectedTab] = useState('Things');

   /* eslint-disable react-hooks/exhaustive-deps */
   // We need to make our container switch to the Things tab when we route to a new member, but wesbos's eslint rules don't let you use a dependency for an effect that isn't referenced in the effect. I can't find any reason why that is or any better way of doing it, so I'm just turning off that rule for a minute.
   useEffect(() => {
      setSelectedTab('Things');
   }, [member.id, member.displayName]);
   /* eslint-enable */

   const selectorTabsArray = ['Things', 'Likes', 'Friends'];
   const selector = (
      <div className="stuffSelector">
         {selectorTabsArray.map(tab => (
            <div
               className={selectedTab === tab ? 'tab selected' : 'tab'}
               onClick={() => setSelectedTab(tab)}
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
               displayType="grid"
               cardSize="regular"
            />
         );
      } else {
         selection = <p>{`${isMe ? 'You' : 'They'} have no things.`}</p>;
      }
   } else if (selectedTab === 'Likes') {
      selection = <p>We ain't made that yet</p>;
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
