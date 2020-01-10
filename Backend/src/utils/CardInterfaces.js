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
exports.fullThingFields = fullThingFields;

const tagFields = `
   __typename
   id
   title
   featuredImage
   owner {
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
