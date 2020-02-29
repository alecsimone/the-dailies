import styled from 'styled-components';
import Router from 'next/router';
import { useState, useContext } from 'react';
import NotificationsContainer from './NotificationsContainer';
import Bell from '../Icons/Bell';
import { setAlpha, setLightness } from '../../styles/functions';
import { MemberContext } from '../Account/MemberProvider';

const StyledNotifications = styled.div`
   margin-right: 2rem;
   position: relative;
   line-height: 0;
   svg.notificationsIcon.desktop {
      display: none;
      ${props => props.theme.mobileBreakpoint} {
         display: block;
      }
   }
   svg.notificationsIcon {
      height: ${props => props.theme.bigText};
      width: auto;
      cursor: pointer;
      ${props => props.theme.mobileBreakpoint} {
         display: none;
      }
   }
   }
   .notificationsCount {
      position: absolute;
      display: table;
      top: 0;
      right: -0.5rem;
      background: hsla(0, 60%, 40%, 0.9);
      color: white;
      padding: 0.4rem;
      border-radius: 100%;
      font-size: 1rem;
      font-weight: 500;
      width: 1.25rem;
      height: 1.25rem;
      line-height: 0.5;
   }
   .notificationsContainer {
      position: absolute;
      top: calc(100% + 2rem + 2px);
      width: 40rem;
      right: -2rem;
      background: ${props => props.theme.deepBlack};
      border: 3px solid ${props => setAlpha(props.theme.lowContrastGrey, 0.25)};
      border-top: 3px solid
         ${props => setAlpha(props.theme.lowContrastGrey, 0.15)};
      text-align: center;
      line-height: 1.4;
      z-index: 9;
      .notificationCard {
         position: relative;
         z-index: 9;
         &:last-child {
            border-bottom: none;
         }
      }
   }
`;

const NotificationsIcon = () => {
   const [showNotifications, setShowNotifications] = useState(false);
   const { me } = useContext(MemberContext);

   const toggleNotificationContainer = () => {
      window.addEventListener('keydown', escapeDetector);
      window.addEventListener('click', clickOutsideDetector);
      setShowNotifications(!showNotifications);
   };

   const escapeDetector = e => {
      if (e.which === 27) {
         setShowNotifications(false);
         window.removeEventListener('click', escapeDetector);
      }
   };

   const clickOutsideDetector = e => {
      if (
         !e.target.classList.contains('notificationsContainer') &&
         e.target.id !== 'bell'
      ) {
         setShowNotifications(false);
         window.removeEventListener('click', clickOutsideDetector);
      }
   };

   let unreadCount = 0;
   if (me && me.notifications) {
      const unreadNotifications = me.notifications.filter(
         notification => notification.unread === true
      );
      unreadCount = unreadNotifications.length;
   }

   return (
      <StyledNotifications className="notificationsWrapper">
         <Bell
            className="notificationsIcon mobile"
            id="notificationIcon"
            alt="notifications icon"
            onClick={() => Router.push({ pathname: '/notifications' })}
         />
         <Bell
            className="notificationsIcon desktop"
            id="notificationIcon"
            alt="notifications icon"
            onClick={() => toggleNotificationContainer()}
         />
         {unreadCount > 0 && (
            <div className="notificationsCount">{unreadCount}</div>
         )}
         {showNotifications && (
            <NotificationsContainer
               notifications={me != null ? me.notifications : []}
            />
         )}
      </StyledNotifications>
   );
};

export default NotificationsIcon;
