const Bundler = require('parcel-bundler');
const express = require('express');
const open = require('open');
const bundler = new Bundler('src/*.pug');
const app = express();

app.get('/', (req, res, next) => {
    req.url = '/index.html';
    app._router.handle(req, res, next);
});

app.use(bundler.middleware());

const port = Number(process.env.PORT || 1235);
app.listen(port);
open(`http://localhost:${port}`, { app: ['chrome'] });
console.log(`listening at http://localhost:${port}`);
