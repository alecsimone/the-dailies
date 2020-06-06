import { useContext } from 'react';
import Things from './Things';
import { MemberContext } from '../Account/MemberProvider';
import LoadingRing from '../LoadingRing';
import { sidebarPerPage } from '../../config';

const MyThings = () => {
   const { me } = useContext(MemberContext);

   if (me == null) {
      return <LoadingRing />;
   }

   if (me.createdThings == null || me.createdThings.length === 0) {
      return <p className="emptyThings">You haven't made any things yet.</p>;
   }
   let myThings = me.createdThings;
   myThings.sort((a, b) => (a.id < b.id ? 1 : -1));
   if (me.broadcastView) {
      myThings = myThings.filter(thing => thing.privacy !== 'Private');
   }

   return (
      <Things
         things={myThings}
         displayType="list"
         cardSize="small"
         noPic
         scrollingParentSelector=".sidebar"
         perPage={sidebarPerPage}
      />
   );
};
MyThings.propTypes = {};

export default MyThings;
