import NotificationsContainer from '../components/Header/NotificationsContainer';
import useMe from '../components/Account/useMe';

const notifications = () => {
   const {
      loggedInUserID,
      memberFields: { notifications: myNotifications }
   } = useMe('notifications', 'notifications');

   return (
      <div className="notificationsPageWrapper">
         <NotificationsContainer
            notifications={loggedInUserID != null ? myNotifications : []}
         />
      </div>
   );
};
export default notifications;
