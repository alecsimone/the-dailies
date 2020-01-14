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
