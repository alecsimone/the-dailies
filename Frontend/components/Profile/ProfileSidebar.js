import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { MemberContext } from '../Account/MemberProvider';
import { setAlpha, setLightness } from '../../styles/functions';
import ProfileBody from './ProfileBody';
import FriendRequests from './FriendRequests';

const CONFIRM_FRIEND_REQUEST_MUTATION = gql`
   mutation CONFIRM_FRIEND_REQUEST_MUTATION($id: ID!) {
      confirmFriendRequest(id: $id) {
         __typename
         id
         friends {
            __typename
            id
         }
         friendRequests {
            __typename
            id
         }
      }
   }
`;
export { CONFIRM_FRIEND_REQUEST_MUTATION };

const StyledProfileSidebar = styled.div`
   padding: 0 2rem;
   .profileBody {
      max-width: 60rem;
      margin: auto;
      .avatarWrapper {
         position: relative;
         .avatarCover {
            position: absolute;
            left: calc(50% - 15rem);
            width: 30rem;
            top: 0;
            height: 100%;
            background: ${props => setAlpha(props.theme.midBlack, 0.75)};
            display: flex;
            align-items: center;
            justify-content: stretch;
            clip-path: circle(calc(15rem + 2px) at center);
            opacity: 0;
            &.editable {
               opacity: 0.9;
            }
            svg.editThis {
               cursor: pointer;
               width: 4rem;
               margin: auto;
            }
            .avatarInputWrapper {
               display: flex;
               align-items: center;
               width: 28rem;
               margin: auto;
               input {
                  background: ${props => props.theme.midBlack};
                  height: 3.5rem;
                  font-size: 1.5rem;
                  flex-grow: 1;
               }
               img.cancel {
                  width: ${props => props.theme.smallText};
                  margin-left: 1rem;
                  opacity: 1;
                  filter: saturate(50%);
               }
            }
            &:hover {
               opacity: 0.9;
            }
         }
         img.avatar,
         svg.avatar {
            display: block;
            width: 30rem;
            height: 30rem;
            object-fit: cover;
            max-width: 100%;
            border-radius: 100%;
            margin: auto;
         }
      }
      .friendsDisplay {
         font-size: ${props => props.theme.bigText};
         text-align: center;
      }
      .friendButtonWrapper {
         text-align: center;
         margin: 2rem 0;
         button {
            padding: 1rem 2rem;
            font-size: ${props => props.theme.smallText};
            background: ${props => props.theme.majorColor};
            &.active {
               &:hover {
                  background: ${props =>
                     setLightness(props.theme.majorColor, 30)};
               }
            }
         }
      }
      .field {
         margin: 1rem 0;
         display: flex;
         align-items: center;
         input {
            font-size: ${props => props.theme.smallText};
         }
         svg.editThis,
         svg.cancel {
            width: ${props => props.theme.smallText};
            margin-left: 1rem;
            opacity: 0.4;
            cursor: pointer;
            &:hover {
               opacity: 0.8;
            }
         }
      }
   }
   .friendRequests {
      text-align: center;
      margin: 3rem 0;
      padding: 2rem;
      font-weight: 700;
      font-size: ${props => props.theme.bigText};
      border-top: 1px solid ${props => props.theme.lowContrastGrey};
   }
`;

const ProfileSidebar = props => {
   const { member, canEdit } = props;
   const { me } = useContext(MemberContext);

   const isMe = me && me.id === member.id;

   const [confirmFriendRequest] = useMutation(CONFIRM_FRIEND_REQUEST_MUTATION);

   return (
      <StyledProfileSidebar>
         <ProfileBody
            member={member}
            me={me}
            isMe={isMe}
            canEdit={canEdit}
            confirmFriendRequest={confirmFriendRequest}
         />
         {isMe && <FriendRequests me={me} isMe={isMe} />}
      </StyledProfileSidebar>
   );
};
ProfileSidebar.propTypes = {
   member: PropTypes.shape({
      avatar: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      rep: PropTypes.number.isRequired,
      points: PropTypes.array.isRequired,
      giveableRep: PropTypes.array.isRequired,
      email: PropTypes.string.isRequired,
      twitchName: PropTypes.string,
      twitterName: PropTypes.string,
      role: PropTypes.string.isRequired
   })
};

export default ProfileSidebar;
