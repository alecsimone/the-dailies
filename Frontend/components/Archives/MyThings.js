import { useContext } from 'react';
import Things from './Things';
import { MemberContext } from '../Account/MemberProvider';

const MyThings = () => {
   const {
      me: { createdThings: myThings }
   } = useContext(MemberContext);
   myThings.sort((a, b) => a.id < b.id);

   if (myThings.length === 0) {
      return <p className="emptyThings">You haven't made any things yet.</p>;
   }
   return <Things things={myThings} displayType="list" cardSize="small" />;
};
MyThings.propTypes = {};

export default MyThings;
