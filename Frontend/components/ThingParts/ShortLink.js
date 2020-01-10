import psl from 'psl';
import { extractHostname } from '../../lib/UrlHandling';

const ShortLink = props => {
   const { link, limit } = props;

   const { domain } = psl.parse(extractHostname(link));
   const startOfDomain = link.indexOf(domain);
   const headlessLink = link.substring(startOfDomain);

   let shortlink;
   if (limit === 0) {
      shortlink = domain;
   } else {
      shortlink =
         headlessLink.length <= limit
            ? headlessLink
            : `${headlessLink.substring(0, limit).trim()}...`;
   }

   // let shortlink = extractHostname(link);
   // console.log(shortlink);
   // if (limit === 0) {
   //    shortlink = psl.parse(shortlink).domain;
   // } else {
   //    const startOfName = link
   //    shortlink =
   //       link.length <= limit ? link : `${link.substring(0, limit).trim()}...`;
   // }

   return (
      <a className="shortlink" href={link} target="_blank">
         {shortlink}
      </a>
   );
};

export default ShortLink;
