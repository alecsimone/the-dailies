import Head from 'next/head';
import React from 'react';
import Columnizer from '../Columnizer';
import CollectionsGroup from './CollectionsGroup';

const CollectionBody = ({ activeCollection, canEdit }) => {
   const { id, userGroups, columnOrders, title, author } = activeCollection;

   const groupElements = userGroups.map((groupObj, index) => (
      <CollectionsGroup
         index={index}
         groupObj={groupObj}
         key={groupObj.id}
         collectionID={id}
         canEdit={canEdit}
      />
   ));

   return (
      <section className="collectionBody">
         <Head>
            <title>{title} - Ouryou</title>
            <meta property="og:title" content={title} />
            <meta
               property="og:description"
               content={`A collection by ${author.displayName}`}
               key="ogDescription"
            />
         </Head>
         <Columnizer
            items={groupElements}
            collectionID={id}
            columnOrders={columnOrders}
            canEdit={canEdit}
         />
      </section>
   );
};
export default React.memo(CollectionBody);
