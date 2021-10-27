import gql from 'graphql-tag';
import styled from 'styled-components';
import { useContext } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
import TrashIcon from './Icons/Trash';
import ColorSelector from './ThingParts/ColorSelector';

const DELETE_TAG_MUTATION = gql`
   mutation DELETE_TAG_MUTATION($id: ID!, $personal: Boolean!) {
      deleteTax(id: $id, personal: $personal) {
         ... on Tag {
            __typename
            id
         }
         ... on Stack {
            __typename
            id
         }
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
   const { __typename: type, author, id, color } = useContext(context);

   const [deleteTax] = useMutation(DELETE_TAG_MUTATION, {
      variables: {
         id,
         personal: type === 'Stack'
      },
      onCompleted: () => Router.push({ pathname: '/' }),
      onError: err => alert(err.message)
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
                        deleteTax();
                     }
                  }}
               />
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
