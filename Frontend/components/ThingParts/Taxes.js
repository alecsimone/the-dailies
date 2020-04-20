import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import styled from 'styled-components';

const StyledTaxes = styled.div`
   display: inline-block;
   h5 {
      display: inline-block;
      font-weight: 500;
      font-size: ${props => props.theme.smallText};
      color: ${props => props.theme.primaryAccent};
      margin: 0.3rem 0rem;
      margin-left: 0;
   }
   a,
   a:visited {
      display: inline-block;
      margin: 0.3rem 0;
      font-size: ${props => props.theme.smallText};
      font-weight: 300;
      color: ${props => props.theme.mainText};
      &.final {
         margin-right: 1.25rem;
      }
   }
`;

const Taxes = ({ taxes, personal }) => {
   const cleanTaxes = taxes.filter(tax => tax.title != '');

   let taxElements;
   if (taxes) {
      taxElements = cleanTaxes.map((tax, index) => (
         <React.Fragment key={tax.id}>
            <Link
               href={{
                  pathname: personal ? '/stack' : '/tag',
                  query: { title: tax.title }
               }}
            >
               <a
                  key={tax.id}
                  className={index < cleanTaxes.length - 1 ? 'bulk' : 'final'}
               >
                  {tax.title}
               </a>
            </Link>
            {index < cleanTaxes.length - 1 && ', '}
         </React.Fragment>
      ));
   }

   return (
      <StyledTaxes className="tags">
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

export default React.memo(Taxes, (prev, next) => {
   if (prev.taxes.length !== next.taxes.length) {
      return false;
   }
   return true;
});
