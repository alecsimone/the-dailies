Object.defineProperty(exports, '__esModule', { value: true });
const prisma_lib_1 = require('prisma-client-lib');
const { typeDefs } = require('./prisma-schema');

const models = [
   {
      name: 'User',
      embedded: false
   }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
   typeDefs,
   models,
   endpoint: `https://us1.prisma.sh/alec-simone/Dailies-DB/dev`
});
exports.prisma = new exports.Prisma();
