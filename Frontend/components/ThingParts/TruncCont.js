const TruncCont = props => {
   const { cont: contObj, limit } = props;
   let cont = contObj.content;

   if (cont.length > limit) {
      cont = `${cont.substring(0, limit).trim()}...`;
   }
   return <p className="truncCont">{cont}</p>;
};

export default TruncCont;
