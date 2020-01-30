import { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ThingContext } from '../../pages/thing';
import { convertISOtoAgo } from '../../lib/ThingHandling';
import { setLightness, setAlpha } from '../../styles/functions';
import AuthorLink from './AuthorLink';
import ShortLink from './ShortLink';
import CategoryDropdown from './CategoryDropdown';
import PrivacyDropdown from './PrivacyDropdown';
import ThingSourceLink from './ThingSourceLink';

const StyledThingMeta = styled.section`
   display: flex;
   justify-content: space-between;
   flex-wrap: wrap;
   padding-left: 1.25rem;
   padding-top: 0.25rem;
   color: ${props => setLightness(props.theme.lowContrastGrey, 40)};
   select,
   span.uneditable {
      color: ${props => setLightness(props.theme.lowContrastGrey, 40)};
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
      display: flex;
      align-items: center;
      a,
      a:visited {
         color: ${props => setLightness(props.theme.lowContrastGrey, 60)};
         margin-left: 0.5rem;
         &:hover {
            color: ${props => setLightness(props.theme.lowContrastGrey, 80)};
            text-decoration: none;
         }
      }
      img {
         width: ${props => props.theme.smallText};
         height: auto;
         margin-left: 1rem;
         cursor: pointer;
         opacity: 0.4;
         &:hover {
            opacity: 0.8;
         }
      }
      form {
         display: inline-block;
         max-width: 90%;
         overflow: hidden;
         margin-left: 0.5rem;
         input {
            font-size: ${props => props.theme.smallText};
            color: ${props => setLightness(props.theme.lowContrastGrey, 60)};
            padding: 0;
            background: hsla(0, 0%, 100%, 0.1);
            &[aria-disabled='true'] {
               background: hsla(0, 0%, 100%, 0.25);
            }
         }
      }
   }
`;

const ThingMeta = props => {
   const { canEdit } = props;
   const {
      id,
      author,
      link,
      partOfCategory,
      privacy,
      createdAt,
      updatedAt
   } = useContext(ThingContext);

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
            {createdAt && (
               <span className="ago">{convertISOtoAgo(createdAt)} ago </span>
            )}
            {author && (
               <span className="author">
                  by <AuthorLink author={author} />
               </span>
            )}
         </div>
         <div className="selections">
            {canEdit ? (
               <CategoryDropdown
                  initialCategory={
                     partOfCategory ? partOfCategory.title : 'Misc'
                  }
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
         {(link || canEdit) && <ThingSourceLink />}
      </StyledThingMeta>
   );
};
ThingMeta.propTypes = {
   canEdit: PropTypes.bool
};

export default ThingMeta;
