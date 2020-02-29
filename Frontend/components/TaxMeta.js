import gql from 'graphql-tag';
import styled from 'styled-components';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
import TrashIcon from './Icons/Trash';

const SET_PUBLICITY_MUTATION = gql`
   mutation SET_PUBLICITY_MUTATION(
      $public: Boolean!
      $id: ID!
      $type: String!
   ) {
      setPublicity(public: $public, id: $id, type: $type) {
         ... on Tag {
            __typename
            id
            public
         }
      }
   }
`;

const DELETE_TAG_MUTATION = gql`
   mutation DELETE_TAG_MUTATION($id: ID!) {
      deleteTag(id: $id) {
         __typename
         id
      }
   }
`;

const StyledTaxMeta = styled.div`
   font-size: ${props => props.theme.tinyText};
   display: flex;
   justify-content: space-between;
   .checkbox {
      margin-top: 0.25rem;
      margin-right: 0.5rem;
      font-size: ${props => props.theme.smallText};
      display: inline-block;
      position: relative;
      padding-right: calc(${props => props.theme.smallText} + 1rem);
      input {
         opacity: 0;
         position: absolute;
         cursor: pointer;
      }
      .customCheckbox {
         position: absolute;
         top: 0.25rem;
         right: 0;
         height: ${props => props.theme.smallText};
         width: ${props => props.theme.smallText};
         background-color: transparent;
         border-radius: 3px;
         border: 2px solid ${props => props.theme.mainText};
         transition: all 0.1s ease-out;
         &::after {
            position: absolute;
            content: '';
            left: 1rem;
            top: 1rem;
            height: 0;
            width: 0;
            border-radius: 3px;
            border: solid ${props => props.theme.midBlack};
            border-width: 0 3px 3px 0;
            transform: rotate(0deg) scale(0);
            opacity: 1;
            transition: all 0.1s ease-out;
         }
      }
      input:checked ~ .customCheckbox {
         background-color: ${props => props.theme.mainText};
         border-radius: 3px;
         transform: rotate(0deg) scale(1);
         opacity: 1;
         border: 2px solid ${props => props.theme.mainText};
         &::after {
            transform: rotate(45deg) scale(1);
            opacity: 1;
            left: 0.6rem;
            top: 0.25rem;
            width: 6px;
            height: 12px;
            border: solid ${props => props.theme.midBlack};
            border-width: 0 2px 2px 0;
            background-color: transparent;
            border-radius: 0;
         }
      }
   }
   svg.trash {
      height: ${props => props.theme.bigText};
      width: auto;
      margin-left: 1rem;
      cursor: pointer;
      &.loading {
         ${props => props.theme.twist};
      }
   }
`;

const TaxMeta = props => {
   const { context, canEdit } = props;
   const { __typename: type, public: isPublic, author, id } = useContext(
      context
   );

   const [setPublicity] = useMutation(SET_PUBLICITY_MUTATION);
   const [deleteTag] = useMutation(DELETE_TAG_MUTATION, {
      variables: {
         id
      },
      onCompleted: () => Router.push({ pathname: '/' })
   });

   const togglePublicity = e => {
      const { checked } = e.target;
      setPublicity({
         variables: {
            public: checked,
            id,
            type
         }
      });
   };

   let checkbox;
   if (type === 'Tag') {
      checkbox = (
         <span className="checkbox">{isPublic ? 'Public' : 'Private'}</span>
      );
      if (canEdit) {
         checkbox = (
            <div className="checkbox">
               <label htmlFor="publicity">
                  Public
                  <input
                     type="checkbox"
                     id="publicity"
                     name="publicity"
                     checked={isPublic}
                     onChange={togglePublicity}
                  />
                  <span className="customCheckbox" />
               </label>
            </div>
         );
      }
   }

   return (
      <StyledTaxMeta>
         {author && `Created by ${author.displayName}`}
         <div className="right">
            {checkbox}
            <TrashIcon
               className="trash"
               onClick={e => {
                  if (
                     confirm(
                        'Are you sure you want to delete that tag? Only the tag will be deleted, not the things attached to it.'
                     )
                  ) {
                     e.target.classList.add('loading');
                     deleteTag();
                  }
               }}
            />
         </div>
      </StyledTaxMeta>
   );
};
TaxMeta.propTypes = {
   context: PropTypes.shape({
      Consumer: PropTypes.object.isRequired,
      Provider: PropTypes.object.isRequired
   }).isRequired,
   canEdit: PropTypes.bool
};

export default TaxMeta;
