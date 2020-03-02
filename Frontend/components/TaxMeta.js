import gql from 'graphql-tag';
import styled from 'styled-components';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
import TrashIcon from './Icons/Trash';
import ColorSelector from './ThingParts/ColorSelector';

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
   .right {
      display: flex;
      align-items: center;
      svg.trash {
         height: ${props => props.theme.bigText};
         width: auto;
         margin: 0 1rem;
         cursor: pointer;
         &.loading {
            ${props => props.theme.twist};
         }
      }
   }
`;

const TaxMeta = ({ context, canEdit }) => {
   const { __typename: type, public: isPublic, author, id, color } = useContext(
      context
   );

   const [deleteTag] = useMutation(DELETE_TAG_MUTATION, {
      variables: {
         id
      },
      onCompleted: () => Router.push({ pathname: '/' })
   });

   return (
      <StyledTaxMeta>
         {author && `Created by ${author.displayName}`}
         {canEdit && (
            <div className="right">
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
               <ColorSelector initialColor={color} type={type} id={id} />
            </div>
         )}
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
