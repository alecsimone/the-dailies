import styled from 'styled-components';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { setLightness, setAlpha } from '../styles/functions';
import Avatar from './Avatar';
import useMe from './Account/useMe';

const StyledMemberCard = styled.article`
   background: ${props => props.theme.midBlack};
   border: 1px solid ${props => setAlpha(props.theme.highContrastGrey, 0.3)};
   display: flex;
   align-items: center;
   justify-content: space-evenly;
   padding: 1rem;
   border-radius: 0.5rem;
   max-width: 35rem;
   width: 100%;
   min-width: 30rem;
   .cardLeft {
      line-height: 0;
      img.avatar,
      svg.avatar {
         border-radius: 100%;
         width: 6rem;
      }
   }
   .cardRight {
      .name {
         font-size: ${props => props.theme.bigText};
         font-weight: 700;
         margin-top: -0.5rem;
         a,
         a:visited {
            color: ${props => props.theme.mainText};
         }
      }
      .meta {
         font-size: ${props => props.theme.tinyText};
         color: ${props => setLightness(props.theme.lowContrastGrey, 35)};
         font-weight: 300;
         /* margin-top: 0; */
      }
   }
`;

const MemberCard = ({ member }) => {
   const {
      loggedInUserID,
      memberFields: { friends }
   } = useMe('MemberCard', 'friends {id}');

   if (member == null) return null;

   const yourFriend =
      loggedInUserID &&
      member.friends &&
      member.friends.some(friend => friend.id === loggedInUserID);
   let mutualFriendCount = 0;
   if (loggedInUserID && friends && member.friends && !yourFriend) {
      friends.forEach(myFriend => {
         const sharedFriends = member.friends.filter(
            theirFriend => theirFriend.id === myFriend.id
         );
         if (sharedFriends && sharedFriends.length > 0) {
            mutualFriendCount++;
         }
      });
   }

   return (
      <StyledMemberCard>
         <div className="cardLeft">
            <Avatar
               id={member.id}
               avatar={member.avatar}
               displayName={member.displayName}
               alt="avatar"
               className="avatar"
            />
         </div>
         <div className="cardRight">
            <div className="name">
               <Link href={{ pathname: '/member', query: { id: member.id } }}>
                  <a>
                     [{member.rep}] {member.displayName}
                  </a>
               </Link>
            </div>
            <div className="meta">
               {member.role}. {yourFriend ? 'Your Friend. ' : ''}
               {`${mutualFriendCount} mutual friend${
                  mutualFriendCount !== 1 ? 's' : ''
               }.`}
            </div>
         </div>
      </StyledMemberCard>
   );
};
MemberCard.propTypes = {
   member: PropTypes.shape({
      friends: PropTypes.array.isRequired,
      avatar: PropTypes.string,
      id: PropTypes.string.isRequired,
      rep: PropTypes.number.isRequired,
      displayName: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired
   }).isRequired
};

export default MemberCard;
