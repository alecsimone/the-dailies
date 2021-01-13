import Link from 'next/link';
import { useState } from 'react';
import DefaultAvatar from './Icons/DefaultAvatar';

const Avatar = ({
   id,
   avatar,
   displayName,
   alt,
   className,
   onClick,
   htmlid,
   doesNotLink
}) => {
   const [brokenAvatar, setBrokenAvatar] = useState(false);

   let altText;
   if (alt != null) {
      altText = alt;
   } else if (displayName != null) {
      altText = displayName;
   } else {
      altText = `Member ${id} Avatar`;
   }

   let avatarImage;
   if (avatar == null || brokenAvatar) {
      avatarImage = (
         <DefaultAvatar onClick={onClick} id={htmlid} className={className} />
      );
   } else {
      avatarImage = (
         <img
            src={avatar}
            htmlid={htmlid}
            className={className != null ? className : 'avatar'}
            onError={() => setBrokenAvatar(true)}
            alt={altText}
            onClick={onClick}
         />
      );
   }

   if (doesNotLink) {
      return avatarImage;
   }

   return (
      <Link href={{ pathname: '/member', query: { id } }}>
         <a>{avatarImage}</a>
      </Link>
   );
};
export default Avatar;
