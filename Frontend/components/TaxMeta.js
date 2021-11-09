import gql from 'graphql-tag';
import styled, { ThemeContext } from 'styled-components';
import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import Router from 'next/router';
import { useSelector } from 'react-redux';
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
   flex-wrap: wrap;
   .right {
      display: flex;
      align-items: center;
      button.colors {
         width: ${props => props.theme.bigText};
         height: 100%;
         border-radius: 50%;
         border: none;
      }
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
   .colorSelector {
      margin-top: 1rem;
      width: 100%;
   }
`;

const TaxMeta = ({ id, canEdit }) => {
   const authorName = useSelector(
      state => state.stuff[`Tag:${id}`].author.displayName
   );
   const color = useSelector(state => state.stuff[`Tag:${id}`].color);

   const { lowContrastGrey } = useContext(ThemeContext);

   const highlightColor = color != null ? color : lowContrastGrey;

   const [showingColorSelector, setShowingColorSelector] = useState(false);

   const [deleteTax] = useMutation(DELETE_TAG_MUTATION, {
      variables: {
         id,
         personal: false
      },
      onCompleted: () => Router.push({ pathname: '/' }),
      onError: err => alert(err.message)
   });

   return (
      <StyledTaxMeta>
         Created by {authorName}
         {canEdit && (
            <div className="right">
               <button
                  className="colors"
                  style={{ background: highlightColor }}
                  onClick={() => {
                     if (!canEdit) return;
                     setShowingColorSelector(!showingColorSelector);
                  }}
                  title="Set Color"
               />
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
         {canEdit && showingColorSelector && (
            <div className="colorSelector">
               <ColorSelector type="Tag" id={id} />
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
