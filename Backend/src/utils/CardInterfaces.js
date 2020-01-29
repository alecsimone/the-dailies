const smallThingCardFields = `
   __typename
   id
   title
   featuredImage
   author {
      __typename
      id
      displayName
      avatar
      friends {
         __typename
         id
      }
   }
   content {
      __typename
      id
      content
   }
   partOfTags {
      __typename
      id
      title
   }
   partOfCategory {
      __typename
      id
      title
      color
   }
   createdAt
   updatedAt
   privacy
`;

const commentFields = `
   __typename
   id
   author {
      __typename
      id
      displayName
      avatar
      rep
   }
   comment
   createdAt
   updatedAt
`;
exports.commentFields = commentFields;

const fullThingFields = `
   __typename
   id
   title
   author {
      __typename
      id
      displayName
      friends {
         __typename
         id
      }
   }
   featuredImage
   link
   content {
      __typename
      id
      content
   }
   partOfTags {
      __typename
      id
      title
   }
   partOfCategory {
      __typename
      id
      title
      color
   }
   comments {
      ${commentFields}
   }
   votes {
      __typename
      voter {
         __typename
         id
         displayName
         avatar
         role
      }
      value
   }
   passes {
      __typename
      passer {
         __typename
         id
         displayName
         avatar
         role
      }
   }
   score
   winner
   finalistDate
   privacy
   eliminated
   createdAt
   updatedAt
`;
exports.fullThingFields = fullThingFields;

const tagFields = `
   __typename
   id
   title
   featuredImage
   author {
      __typename
      id
      displayName
   }
   public
   content {
      __typename
      id
      content
   }
   connectedThings {
      ${smallThingCardFields}
   }
   comments {
      ${commentFields}
   }
   createdAt
`;
exports.tagFields = tagFields;

const catFields = `
   __typename,
   id
   title
   featuredImage
   color
   content {
      __typename
      id
      content
   }
   connectedThings {
      ${smallThingCardFields}
   }
   comments {
      ${commentFields}
   }
   createdAt
`;
exports.catFields = catFields;

const fullMemberFields = `
   __typename
   id
   displayName
   name
   avatar
   rep
   points
   giveableRep
   friends {
      __typename
      id
      displayName
      avatar
      rep
      role
      friends {
         __typename
         id
         displayName
         avatar
         rep
         createdThings {
            ${smallThingCardFields}
         }
      }
   }
   twitchName
   email
   votes {
      __typename
      id
      onThing {
         ${smallThingCardFields}
      }
      value
      createdAt
   }
   createdThings {
      ${smallThingCardFields}
   }
   defaultCategory {
      __typename
      id
      title
   }
   defaultPrivacy
   comments {
      __typename
      id
      author {
         __typename
         id
         displayName
         avatar
         rep
      }
      comment
      createdAt
      updatedAt
      onThing {
         __typename
         id
         title
      }
      onComment {
         __typename
         id
      }
      onTag {
         __typename
         id
         title
      }
      onCategory {
         __typename
         id
         title
      }
   }
   role
   twitterUserName
   createdAt
`;
exports.fullMemberFields = fullMemberFields;
