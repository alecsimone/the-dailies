import { useContext } from 'react';
import NotificationsContainer from '../components/Header/NotificationsContainer';
import { MemberContext } from '../components/Account/MemberProvider';

const notifications = () => {
   const { me } = useContext(MemberContext);

   return (
      <div className="notificationsPageWrapper">
         <NotificationsContainer
            notifications={me != null ? me.notifications : []}
         />
      </div>
   );
};
export default notifications;
