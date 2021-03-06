import Link from 'next/link';
import PropTypes from 'prop-types';
import Avatar from '../Avatar';

const AuthorLink = ({ author, noPic }) => {
   if (author == null) {
      return null;
   }
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

export default AuthorLink;
