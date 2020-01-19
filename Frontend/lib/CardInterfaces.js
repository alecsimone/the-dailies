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
export { commentFields };

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
         id
         friends {
            id
         }
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
export { smallThingCardFields };

const fullThingFields = `
   __typename
   id
   title
   author {
      __typename
      id
      displayName
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
         roles
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
         roles
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
export { fullThingFields };

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
export { tagFields };

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
export { catFields };

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
      roles
      friends {
         __typename
         id
         displayName
         avatar
         rep
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
   roles
   twitterUserName
   createdAt
`;
export { fullMemberFields };
