import { useContext } from 'react';
import Things from './Things';
import { MemberContext } from '../Account/MemberProvider';

const MyThings = () => {
   const { me } = useContext(MemberContext);
   if (
      me == null ||
      me.createdThings == null ||
      me.createdThings.length === 0
   ) {
      return <p className="emptyThings">You haven't made any things yet.</p>;
   }
   const myThings = me.createdThings;
   myThings.sort((a, b) => a.id < b.id);

   return <Things things={myThings} displayType="list" cardSize="small" />;
};
MyThings.propTypes = {};

export default MyThings;
