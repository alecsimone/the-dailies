import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledProfileSidebar = styled.div`
   padding: 0 2rem;
   img.avatar {
      display: block;
      width: 30rem;
      max-width: 100%;
      border-radius: 100%;
      margin: 0 auto 2rem;
   }
   div {
      margin: 1rem 0;
      display: flex;
      align-items: center;
      img.edit {
         width: ${props => props.theme.smallText};
         margin-left: 1rem;
         opacity: 0.4;
         cursor: pointer;
         &:hover {
            opacity: 0.8;
         }
      }
   }
`;

const ProfileSidebar = props => {
   const {
      member: {
         avatar,
         displayName,
         rep,
         points,
         giveableRep,
         email,
         twitchName,
         twitterName,
         roles
      },
      canEdit
   } = props;

   return (
      <StyledProfileSidebar>
         <img
            src={avatar || '/defaultAvatar.jpg'}
            alt="avatar"
            className="avatar"
         />
         <div>
            Display Name: {displayName}{' '}
            <img
               className="edit displayName"
               src="/edit-this.png"
               alt="edit displayName"
            />
         </div>
         <div>Rep: {rep}</div>
         <div>Points: {points}</div>
         <div>Giveable Rep: {giveableRep}</div>
         <div>
            Email: {email}{' '}
            <img className="edit email" src="/edit-this.png" alt="edit email" />
         </div>
         <div>
            Twitch Name: {twitchName || 'Not set'}{' '}
            <img
               className="edit twitchName"
               src="/edit-this.png"
               alt="edit twitchName"
            />
         </div>
         <div>Twitter Name: {twitterName || 'Not set'}</div>
         <div>Role: {roles[0]}</div>
      </StyledProfileSidebar>
   );
};
ProfileSidebar.propTypes = {
   member: PropTypes.shape({
      avatar: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired,
      rep: PropTypes.array.isRequired,
      points: PropTypes.array.isRequired,
      giveableRep: PropTypes.array.isRequired,
      email: PropTypes.string.isRequired,
      twitchName: PropTypes.string,
      twitterName: PropTypes.string,
      roles: PropTypes.array.isRequired
   })
};

export default ProfileSidebar;
