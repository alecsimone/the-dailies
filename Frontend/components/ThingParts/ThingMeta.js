import { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ThingContext } from '../../pages/thing';
import { MemberContext } from '../Account/MemberProvider';
import { convertISOtoAgo } from '../../lib/ThingHandling';
import { setLightness, setAlpha } from '../../styles/functions';
import AuthorLink from './AuthorLink';
import ShortLink from './ShortLink';
import CategoryDropdown from './CategoryDropdown';
import PrivacyDropdown from './PrivacyDropdown';

const StyledThingMeta = styled.section`
   display: flex;
   justify-content: space-between;
   flex-wrap: wrap;
   padding-left: 1.25rem;
   padding-top: 0.25rem;
   color: ${props => setLightness(props.theme.lowContrastGrey, 40)};
   select,
   span.uneditable {
      color: ${props => setLightness(props.theme.highContrastGrey, 40)};
      margin-left: 2rem;
   }
   select {
      border-top: none;
      border-right: none;
      border-left: none;
      background: url('/dropdown.png') no-repeat right;
      appearance: none;
      padding-right: 30px;
   }
   .info {
      font-size: ${props => props.theme.tinyText};
      a.authorLink,
      a.authorLink:visited {
         color: ${props =>
            setAlpha(setLightness(props.theme.majorColor, 80), 0.7)};
         &:hover {
            color: ${props => setLightness(props.theme.majorColor, 50)};
         }
      }
   }
   .link {
      font-size: ${props => props.theme.smallText};
      width: 100%;
      margin-top: 1rem;
      a,
      a:visited {
         color: ${props => setLightness(props.theme.lowContrastGrey, 60)};
         &:hover {
            color: ${props => setLightness(props.theme.lowContrastGrey, 80)};
            text-decoration: none;
         }
      }
   }
`;

const ThingMeta = () => {
   const {
      id,
      author,
      link,
      partOfCategory,
      privacy,
      createdAt,
      updatedAt
   } = useContext(ThingContext);

   const { me } = useContext(MemberContext);

   let canEdit = false;
   if (me && author.id === me.id) {
      canEdit = true;
   }

   if (id == null) {
      return (
         <StyledThingMeta>
            <div className="info">Loading...</div>
         </StyledThingMeta>
      );
   }

   return (
      <StyledThingMeta className="thingMeta">
         <div className="info">
            <span className="ago">{convertISOtoAgo(createdAt)} ago</span>{' '}
            <span className="author">
               by <AuthorLink author={author} />
            </span>
         </div>
         <div className="selections">
            {canEdit ? (
               <CategoryDropdown
                  initialCategory={partOfCategory.title}
                  id={id}
               />
            ) : (
               <span className="uneditable">{partOfCategory.title}</span>
            )}
            {canEdit ? (
               <PrivacyDropdown initialPrivacy={privacy} id={id} />
            ) : (
               <span className="uneditable">{privacy}</span>
            )}
         </div>
         {link && (
            <div className="link">
               re: <ShortLink link={link} limit={100} />
            </div>
         )}
      </StyledThingMeta>
   );
};
ThingMeta.propTypes = {};

export default ThingMeta;
