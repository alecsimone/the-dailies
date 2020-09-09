import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useContext } from 'react';
import Link from 'next/link';
import Things from './Things';
import { MemberContext } from '../Account/MemberProvider';
import LoadingRing from '../LoadingRing';
import ErrorMessage from '../ErrorMessage';
import { ModalContext } from '../ModalProvider';
import Login from '../Account/Login';
import Signup from '../Account/Signup';
import { sidebarPerPage } from '../../config';
import { smallThingCardFields } from '../../lib/CardInterfaces';

const MY_THINGS_QUERY = gql`
   query MY_THINGS_QUERY {
      myThings {
         ${smallThingCardFields}
      }
   }
`;

const MyThings = () => {
   const { me } = useContext(MemberContext);
   const { setContent } = useContext(ModalContext);

   const { data, loading, error } = useQuery(MY_THINGS_QUERY, { ssr: false });

   if (error) {
      return <ErrorMessage error={error} />;
   }

   if (data) {
      if (data.myThings == null || data.myThings.length === 0) {
         return <p className="emptyThings">You haven't made any things yet.</p>;
      }
      if (me == null) {
         return (
            <p className="emptyThings">
               <Link href={{ pathname: '/login' }}>
                  <a
                     onClick={e => {
                        e.preventDefault();
                        setContent(<Login redirect={false} />);
                     }}
                  >
                     Log in
                  </a>
               </Link>{' '}
               or{' '}
               <Link href={{ pathname: '/signup' }}>
                  <a
                     onClick={e => {
                        e.preventDefault();
                        setContent(<Signup />);
                     }}
                  >
                     sign up
                  </a>
               </Link>{' '}
               to start making things!
            </p>
         );
      }
      let { myThings } = data;
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
   }

   if (loading) {
      return <LoadingRing />;
   }
};
MyThings.propTypes = {};

export default MyThings;
