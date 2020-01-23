import styled from 'styled-components';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useContext } from 'react';
import { setLightness, setAlpha } from '../styles/functions';
import { MemberContext } from './Account/MemberProvider';

const StyledMemberCard = styled.article`
   background: ${props => props.theme.black};
   border: 1px solid ${props => setAlpha(props.theme.highContrastGrey, 0.3)};
   display: flex;
   align-items: center;
   padding: 1rem;
   border-radius: 0.5rem;
   max-width: 35rem;
   min-width: 30rem;
   .cardLeft {
      margin-right: 1.5rem;
      line-height: 0;
      img.avatar {
         border-radius: 100%;
         width: 6rem;
      }
   }
   .cardRight {
      .meta {
         font-size: ${props => props.theme.tinyText};
         color: ${props => setLightness(props.theme.lowContrastGrey, 35)};
         font-weight: 300;
         margin-top: 0;
      }
   }
`;

const MemberCard = props => {
   const { member } = props;
   const { me } = useContext(MemberContext);

   const yourFriend = member.friends.some(friend => friend.id === me.id);

   return (
      <StyledMemberCard>
         <div className="cardLeft">
            <img
               src={member.avatar ? member.avatar : '/defaultAvatar.jpg'}
               className="avatar"
               alt="avatar"
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
            </div>
         </div>
      </StyledMemberCard>
   );
};
MemberCard.propTypes = {
   member: PropTypes.object.isRequired
};

export default MemberCard;
