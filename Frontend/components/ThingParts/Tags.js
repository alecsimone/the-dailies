import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import styled from 'styled-components';
import { argsToArgsConfig } from 'graphql/type/definition';

const StyledTags = styled.div`
   display: inline-block;
   h5 {
      display: inline-block;
      font-weight: 500;
      font-size: ${props => props.theme.smallText};
      color: ${props => props.theme.primaryAccent};
      margin: 0.3rem 0rem;
      margin-left: 0;
   }
   a {
      display: inline-block;
      margin: 0.3rem 0;
      font-size: ${props => props.theme.smallText};
      font-weight: 300;
      &.final {
         margin-right: 1.25rem;
      }
   }
`;

const Tags = props => {
   const { tags } = props;

   const cleanTags = tags.filter(tag => tag.title != '');

   let tagElements;
   if (tags) {
      tagElements = cleanTags.map((tag, index) => {
         if (index < cleanTags.length - 1)
            return (
               <React.Fragment key={tag.id}>
                  <Link
                     href={{ pathname: '/tag', query: { title: tag.title } }}
                  >
                     <a>{tag.title}</a>
                  </Link>
                  ,{' '}
               </React.Fragment>
            );
         return (
            <React.Fragment key={tag.id}>
               <Link href={{ pathname: '/tag', query: { title: tag.title } }}>
                  <a key={tag.id} className="final">
                     {tag.title}
                  </a>
               </Link>
            </React.Fragment>
         );
      });
   }

   return (
      <StyledTags className="tags">
         <h5 title="Tags are public, anyone can add to them">Tags:</h5>{' '}
         {tagElements}
      </StyledTags>
   );
};
Tags.propTypes = {
   tags: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.string.isRequired,
         title: PropTypes.string.isRequired
      })
   )
};

export default Tags;
