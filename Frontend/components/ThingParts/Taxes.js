import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import styled from 'styled-components';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import X from '../Icons/X';
import EditThis from '../Icons/EditThis';

const REMOVE_TAX_MUTATION = gql`
   mutation REMOVE_TAX_MUTATION(
      $tax: String!
      $thingID: ID!
      $personal: Boolean!
   ) {
      removeTaxFromThing(tax: $tax, thingID: $thingID, personal: $personal) {
         __typename
         id
         partOfTags {
            __typename
            id
            title
            author {
               __typename
               id
               displayName
            }
         }
         partOfStacks {
            __typename
            id
            title
            author {
               __typename
               id
               displayName
            }
         }
      }
   }
`;

const StyledTaxes = styled.div`
   display: inline-block;
   svg.editThis {
      width: ${props => props.theme.smallText};
      height: ${props => props.theme.smallText};
      margin-right: 1rem;
      opacity: 0.75;
      position: relative;
      top: 0.25rem;
      ${props => props.theme.mobileBreakpoint} {
         display: none;
      }
   }
   h5 {
      display: inline-block;
      font-weight: 500;
      font-size: ${props => props.theme.smallText};
      color: ${props => props.theme.primaryAccent};
      margin: 0.3rem 0rem;
      margin-left: 0;
   }
   .taxWrapper {
      display: inline-flex;
      align-items: center;
      margin-right: 0.75rem;
      a,
      a:visited {
         display: inline-block;
         margin: 0.3rem 0;
         font-size: ${props => props.theme.smallText};
         font-weight: 300;
         color: ${props => props.theme.mainText};
      }
      &.final {
         margin-right: 1.25rem;
      }
      svg.x {
         display: none;
         width: ${props => props.theme.miniText};
         height: ${props => props.theme.miniText};
         margin-left: 1rem;
         cursor: pointer;
         &.showing {
            display: block;
         }
      }
      &:hover {
         svg.x {
            display: block;
            opacity: 0.8;
         }
      }
   }
`;

const Taxes = ({
   tags = [],
   stacks = [],
   personal,
   thingID,
   canEdit = false
}) => {
   const [removeTaxFromThing] = useMutation(REMOVE_TAX_MUTATION);

   const [showingXs, setShowingXs] = useState(false);

   const taxes = personal ? stacks : tags;

   let taxElements;
   const cleanTaxes = taxes.filter(tax => tax.title != '');
   if (taxes) {
      taxElements = cleanTaxes.map((tax, index) => (
         <div
            className={
               index < cleanTaxes.length - 1
                  ? 'taxWrapper bulk'
                  : 'taxWrapper final'
            }
         >
            <Link
               href={{
                  pathname: personal ? '/stack' : '/tag',
                  query: { title: tax.title }
               }}
            >
               <a key={tax.id}>{tax.title}</a>
            </Link>
            {canEdit && (
               <X
                  className={showingXs ? 'showing' : 'hidden'}
                  color="mainText"
                  onClick={() => {
                     const taxToRemove = tax.title;

                     let newTags = [...tags];
                     let newStacks = [...stacks];

                     if (personal) {
                        newStacks = newStacks.filter(
                           stack => stack.title !== taxToRemove
                        );
                     } else {
                        newTags = newTags.filter(
                           tag => tag.title !== taxToRemove
                        );
                     }

                     removeTaxFromThing({
                        variables: {
                           tax: taxToRemove,
                           thingID,
                           personal
                        },
                        optimisticResponse: {
                           __typename: 'Mutation',
                           removeTaxFromThing: {
                              __typename: 'Thing',
                              id: thingID,
                              partOfTags: newTags,
                              partOfStacks: newStacks
                           }
                        }
                     });
                  }}
               />
            )}
            {index < cleanTaxes.length - 1 && ', '}
         </div>
      ));
   }

   return (
      <StyledTaxes className="tags">
         {canEdit && cleanTaxes && cleanTaxes.length > 0 && (
            <EditThis onClick={() => setShowingXs(!showingXs)} />
         )}
         <h5
            title={
               personal
                  ? 'Stacks are personal, only you can add to them'
                  : 'Tags are public, anyone can add to them'
            }
         >
            {personal ? 'Stacks' : 'Tags'}:
         </h5>{' '}
         {taxElements}
      </StyledTaxes>
   );
};
Taxes.propTypes = {
   taxes: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.string.isRequired,
         title: PropTypes.string.isRequired
      })
   )
};

export default Taxes;
