import Link from 'next/link';
import PropTypes from 'prop-types';
import DefaultAvatar from '../Icons/DefaultAvatar';

const AuthorLink = ({ author, noPic }) => {
   if (author == null) {
      return null;
   }
   return (
      <Link href={{ pathname: '/member', query: { id: author.id } }}>
         <div className="authorBlock">
            {!noPic &&
               (author.avatar == null ? (
                  <DefaultAvatar className="authorImg" />
               ) : (
                  <img className="authorImg" src={author.avatar} />
               ))}
            <a className="authorLink">{author.displayName}</a>
         </div>
      </Link>
   );
};
AuthorLink.propTypes = {
   author: PropTypes.shape({
      id: PropTypes.string.isRequired,
      displayName: PropTypes.string.isRequired
   })
};

export default AuthorLink;
