import { useContext } from 'react';
import Things from './Things';
import { MemberContext } from '../Account/MemberProvider';
import LoadingRing from '../LoadingRing';

const MyThings = () => {
   const { me } = useContext(MemberContext);

   if (me == null) {
      return <LoadingRing />;
   }

   if (me.createdThings == null || me.createdThings.length === 0) {
      return <p className="emptyThings">You haven't made any things yet.</p>;
   }
   const myThings = me.createdThings;
   myThings.sort((a, b) => (a.id < b.id ? 1 : -1));

   return (
      <Things things={myThings} displayType="list" cardSize="small" noPic />
   );
};
MyThings.propTypes = {};

export default MyThings;
