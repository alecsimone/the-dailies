require('dotenv').config({ path: 'variables.env' });
const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

const PORT = 4000;
const app = express();

const corsOptions = {
   origin: process.env.FRONTEND_URL,
   credentials: true
};
app.use(cors(corsOptions));

app.use(cookieParser());

app.use((req, res, next) => {
   const { token } = req.cookies;
   if (token) {
      const { memberId } = jwt.verify(token, process.env.APP_SECRET);
      req.memberId = memberId;
   }
   next();
});

app.use(async (req, res, next) => {
   if (!req.memberId) return next();
   const member = await db.query.member(
      { where: { id: req.memberId } },
      '{id roles rep}'
   );
   req.member = member;
   next();
});

server.applyMiddleware({
   app,
   path: '/',
   cors: false
});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
   console.log(
      `Server is now running at http://localhost:${PORT}${server.graphqlPath}`
   );
   console.log(
      `Subscriptions are available at ws://localhost:${PORT}${
         server.subscriptionsPath
      }`
   );
});
