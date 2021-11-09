import Link from 'next/link';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import Avatar from '../Avatar';

const AuthorLink = ({ thingID, type, noPic }) => {
   const author = useSelector(
      state => state.stuff[`${type}:${thingID}`].author
   );
   return (
      <Link href={{ pathname: '/member', query: { id: author.id } }}>
         <a>
            <div className="authorBlock">
               {!noPic && (
                  <Avatar
                     className="authorImg"
                     avatar={author.avatar}
                     doesNotLink
                  />
               )}
               <a className="authorLink">
                  {author.rep != null && `[${author.rep}]`} {author.displayName}
               </a>
            </div>
         </a>
      </Link>
   );
};
AuthorLink.propTypes = {
   author: PropTypes.shape({
      id: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      rep: PropTypes.number.isRequired,
      displayName: PropTypes.string.isRequired
   })
};

export default React.memo(AuthorLink);
