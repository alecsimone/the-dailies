import { useContext } from 'react';
import Things from './Things';
import { MemberContext } from '../Account/MemberProvider';

const MyThings = () => {
   const {
      me: { createdThings: myThings }
   } = useContext(MemberContext);
   myThings.sort((a, b) => a.id < b.id);

   return <Things things={myThings} displayType="list" cardSize="small" />;
};
MyThings.propTypes = {};

export default MyThings;