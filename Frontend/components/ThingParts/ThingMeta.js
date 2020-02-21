import { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
import { ThingContext } from '../../pages/thing';
import { convertISOtoAgo } from '../../lib/ThingHandling';
import { setLightness, setAlpha } from '../../styles/functions';
import AuthorLink from './AuthorLink';
import ShortLink from './ShortLink';
import CategoryDropdown from './CategoryDropdown';
import PrivacyDropdown from './PrivacyDropdown';
import ThingSourceLink from './ThingSourceLink';

const DELETE_THING_MUTATION = gql`
   mutation DELETE_THING_MUTATION($id: ID!) {
      deleteThing(id: $id) {
         __typename
         id
      }
   }
`;

const StyledThingMeta = styled.section`
   display: flex;
   justify-content: space-between;
   align-items: center;
   flex-wrap: wrap;
   padding: 0 1rem;
   margin-top: 3rem;
   color: ${props => setLightness(props.theme.lowContrastGrey, 40)};
   ${props => props.theme.mobileBreakpoint} {
      padding-left: 1.25rem;
   }
   .metaPiece {
      margin: 2rem 0;
      flex-grow: 1;
      &:first-child {
         margin-top: 0.5rem;
      }
      &.selections {
         display: flex;
         justify-content: space-between;
      }
      ${props => props.theme.mobileBreakpoint} {
         margin: 0;
         &:first-child {
            margin-top: 0;
         }
         &.selections {
            display: inline-block;
            flex-grow: 0;
         }
      }
   }
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
      font-size: ${props => props.theme.smallText};
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .authorBlock {
         display: inline-flex;
         align-items: center;
         margin-right: 1rem;
         flex-grow: 0;
         cursor: pointer;
         .authorLink {
            margin-bottom: 2px;
         }
         .authorImg {
            width: 3rem;
            height: 3rem;
            border-radius: 100%;
            margin-right: 1rem;
         }
      }
      a.authorLink,
      a.authorLink:visited {
         color: ${props =>
            setAlpha(setLightness(props.theme.majorColor, 80), 0.7)};
         &:hover {
            color: ${props => setLightness(props.theme.majorColor, 50)};
         }
      }
   }
   .trash {
      width: 3rem;
      height: 3rem;
      cursor: pointer;
      ${props => props.theme.mobileBreakpoint} {
         opacity: 0.75;
         &:hover {
            opacity: 1;
         }
      }
      &.deleting {
         ${props => props.theme.twist};
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
      svg {
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

   const [deleteThing, { loading: deleting }] = useMutation(
      DELETE_THING_MUTATION,
      {
         onCompleted: data => {
            Router.push({
               pathname: '/'
            });
         }
      }
   );

   if (id == null) {
      return (
         <StyledThingMeta>
            <div className="info">Loading...</div>
         </StyledThingMeta>
      );
   }

   return (
      <StyledThingMeta className="thingMeta">
         <div className="info metaPiece">
            {author && <AuthorLink author={author} />}{' '}
            {createdAt && (
               <span className="ago">{convertISOtoAgo(createdAt)} ago </span>
            )}
         </div>
         <img
            className={deleting ? 'trash deleting' : 'trash'}
            src="/trash.png"
            onClick={() => {
               if (confirm('Are you sure you want to delete this thing?')) {
                  deleteThing({
                     variables: {
                        id
                     }
                  });
               }
            }}
         />
         <div className="selections metaPiece">
            {canEdit ? (
               <CategoryDropdown
                  initialCategory={
                     partOfCategory ? partOfCategory.title : 'Misc'
                  }
                  id={id}
               />
            ) : (
               <span className="uneditable metaPiece">
                  {partOfCategory.title}
               </span>
            )}
            {canEdit ? (
               <PrivacyDropdown initialPrivacy={privacy} id={id} />
            ) : (
               <span className="uneditable">{privacy}</span>
            )}
         </div>
         {(link || canEdit) && <ThingSourceLink canEdit={canEdit} />}
      </StyledThingMeta>
   );
};
ThingMeta.propTypes = {
   canEdit: PropTypes.bool
};

export default ThingMeta;
