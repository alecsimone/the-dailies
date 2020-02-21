import Link from 'next/link';
import PropTypes from 'prop-types';

const AuthorLink = ({ author, noPic }) => {
   if (author == null) {
      return null;
   }
   return (
      <Link href={{ pathname: '/member', query: { id: author.id } }}>
         <div className="authorBlock">
            {!noPic && (
               <img
                  className="authorImg"
                  src={
                     author.avatar == null
                        ? '/defaultAvatar.jpg'
                        : author.avatar
                  }
               />
            )}
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
