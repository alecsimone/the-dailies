import { useState, useEffect } from 'react';
import Things from '../Archives/Things';
import MemberCard from '../MemberCard';

const ProfileContent = props => {
   const { member } = props;
   const [selectedTab, setSelectedTab] = useState('Things');

   /* eslint-disable react-hooks/exhaustive-deps */
   // We need to make our container switch to the Things tab when we route to a new member, but wesbos's eslint rules don't let you use a dependency for an effect that isn't referenced in the effect. I can't find any reason why that is or any better way of doing it, so I'm just turning off that rule for a minute.
   useEffect(() => {
      setSelectedTab('Things');
   }, [member.id, member.displayName]);
   /* eslint-enable */

   const sortedThings = member.createdThings.sort((a, b) => {
      const aDate = new Date(a.createdAt);
      const bDate = new Date(b.createdAt);
      return bDate - aDate;
   });

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
      selection = (
         <Things things={sortedThings} displayType="grid" cardSize="regular" />
      );
   } else if (selectedTab === 'Likes') {
      selection = <p>We ain't made that yet</p>;
   } else if (selectedTab === 'Friends') {
      if (member.friends.length === 0) {
         selection = <p>You have no friends.</p>;
      } else {
         const friendCards = member.friends.map(friend => (
            <MemberCard member={friend} />
         ));
         selection = <div className="friends">{friendCards}</div>;
      }
   }

   return (
      <div className="stuffWrapper">
         {selector}
         {selection}
      </div>
   );
};

export default ProfileContent;
