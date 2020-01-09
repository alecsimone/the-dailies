import gql from 'graphql-tag';
import styled from 'styled-components';
import { useContext, useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { MemberContext } from './Account/MemberProvider';

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
            border: solid ${props => props.theme.black};
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
            border: solid ${props => props.theme.black};
            border-width: 0 2px 2px 0;
            background-color: transparent;
            border-radius: 0;
         }
      }
   }
`;

const TaxMeta = props => {
   const { context } = props;
   const { __typename: type, public: isPublic, owner, id } = useContext(
      context
   );

   const { me } = useContext(MemberContext);

   const [setPublicity] = useMutation(SET_PUBLICITY_MUTATION);

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
   if (owner.id === me.id) {
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

   return (
      <StyledTaxMeta>
         Owned by {owner.displayName}
         {checkbox}
      </StyledTaxMeta>
   );
};

export default TaxMeta;
