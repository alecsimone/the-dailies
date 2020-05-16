import gql from 'graphql-tag';
import styled from 'styled-components';
import { useMutation } from '@apollo/react-hooks';
import { useEffect, useContext } from 'react';
import { MemberContext } from '../Account/MemberProvider';
import NotificationCard from './NotificationCard';
import { fullMemberFields } from '../../lib/CardInterfaces';
import { CURRENT_MEMBER_QUERY } from '../Account/MemberProvider';

const READ_NOTIFICATIONS_MUTATION = gql`
   mutation READ_NOTIFICATIONS_MUTATION($ids: [ID]!) {
      readNotifications(ids: $ids) {
         ${fullMemberFields}
      }
   }
`;

const StyledNotificationsContainer = styled.div`
   h3 {
      text-align: center;
      font-size: ${props => props.theme.bigText};
      font-weight: 300;
      margin: 2rem;
      ${props => props.theme.mobileBreakpoint} {
         margin: 1rem;
      }
   }
`;

const NotificationsContainer = ({ notifications }) => {
   const [readNotifications] = useMutation(READ_NOTIFICATIONS_MUTATION);

   const { me } = useContext(MemberContext);

   /* eslint-disable react-hooks/exhaustive-deps */
   useEffect(() => {
      if (notifications != null && notifications.length > 0) {
         const idsToUpdate = [];
         const updatedNotifications = [];
         notifications.forEach(notification => {
            if (notification.unread === true) {
               idsToUpdate.push(notification.id);
               notification.unread = false;
            }
            updatedNotifications.push(notification);
         });
         if (idsToUpdate.length > 0) {
            readNotifications({
               variables: {
                  ids: idsToUpdate
               },
               optimisticResponse: {
                  __typename: 'Mutation',
                  readNotifications: {
                     ...me,
                     notifications: updatedNotifications
                  }
               },
               update: (client, { data }) => {
                  const oldData = client.readQuery({
                     query: CURRENT_MEMBER_QUERY
                  });
                  oldData.me.notifications.forEach((oldNotification, index) => {
                     if (idsToUpdate.includes(oldNotification.id)) {
                        oldData.me.notifications[index].unread = false;
                     }
                  });
                  // const newDataObj = {
                  //    me: {
                  //       ...me,
                  //       notifications: updatedNotifications
                  //    }
                  // };
                  client.writeQuery({
                     query: CURRENT_MEMBER_QUERY,
                     data: oldData
                  });
               }
            });
         }
      }
   }, [notifications.length]);

   let notificationCards;
   if (notifications == null || notifications.length === 0) {
      notificationCards = <div className="noNotes">No notifications</div>;
   } else {
      notifications.sort((a, b) => (a.id < b.id ? 1 : -1));
      notificationCards = notifications.map(notification => (
         <NotificationCard notification={notification} />
      ));
   }

   return (
      <StyledNotificationsContainer className="notificationsContainer">
         <h3>Notifications</h3>
         {notificationCards}
      </StyledNotificationsContainer>
   );
};
export default NotificationsContainer;
