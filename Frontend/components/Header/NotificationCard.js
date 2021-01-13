import styled from 'styled-components';
import Link from 'next/link';
import { useState } from 'react';
import FriendRequest from '../Profile/FriendRequest';
import X from '../Icons/X';
import { setAlpha, setLightness } from '../../styles/functions';
import Avatar from '../Avatar';

const StyledNotificationCard = styled.div`
   background: ${props => props.theme.deepBlack};
   display: flex;
   &.friendRequestNotification {
      flex-wrap: wrap;
      .friendRequest {
         padding: 1rem 0;
      }
   }
   align-items: center;
   padding: 2rem 1rem;
   border-bottom: 2px solid
      ${props => setAlpha(props.theme.lowContrastGrey, 0.6)};
   &:first-of-type {
      border-top: 2px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.6)};
   }
   cursor: pointer;
   &.unread {
      background: ${props => props.theme.midBlack};
   }
   .cardLeft {
      flex-grow: 0;
      img,
      svg {
         width: 6rem;
         height: 6rem;
         border-radius: 100%;
      }
   }
   .cardMiddle {
      flex-grow: 1;
      margin: 0 2rem;
   }
   .cardRight {
      flex-grow: 0;
      padding: 0 1rem;
      svg {
         width: 2rem;
         height: 2rem;
         opacity: 0.5;
         &:hover {
            opacity: 0.9;
         }
      }
   }
`;

const NotificationCard = ({ notification }) => {
   const [startedUnread] = useState(notification && notification.unread);
   if (notification == null) {
      return null;
   }

   const { kind, initiator, linkQuery } = notification;

   let message = initiator.displayName;
   if (kind === 'friendRequest') {
      message += ' sent you a friend request';
   } else if (kind === 'comment') {
      message += " commented on a discussion you're part of";
   }

   let linkObject = {};
   if (kind === 'friendRequest') {
      linkObject = { pathname: '/me' };
   } else if (kind === 'comment') {
      linkObject = {
         pathname: '/thing',
         query: {
            id: linkQuery
         }
      };
   }

   if (kind === 'friendRequest') {
      return (
         <StyledNotificationCard
            className={`notificationCard friendRequestNotification ${
               startedUnread ? 'unread' : 'read'
            }`}
         >
            <div className="cardTop">{message}</div>
            <div className="cardBot">
               <FriendRequest requester={initiator} />
            </div>
         </StyledNotificationCard>
      );
   }

   return (
      <Link href={linkObject}>
         <StyledNotificationCard
            className={`notificationCard ${startedUnread ? 'unread' : 'read'}`}
         >
            <div className="cardLeft">
               <Avatar
                  avatar={initiator.avatar}
                  displayName={initiator.displayname}
                  id={initiator.id}
               />
            </div>
            <div className="cardMiddle">{message}</div>
         </StyledNotificationCard>
      </Link>
   );
};
export default NotificationCard;
