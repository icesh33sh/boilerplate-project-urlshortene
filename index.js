require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urls = [];

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  const parsedUrl = urlparser.parse(originalUrl);

  if (!parsedUrl.protocol || !parsedUrl.hostname) {
    return res.json({ error: 'invalid url' });
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, function(err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const existing = urls.find(item => item.original_url === originalUrl);

    if (existing) {
      return res.json(existing);
    }

    const newUrl = {
      original_url: originalUrl,
      short_url: urls.length + 1
    };

    urls.push(newUrl);

    res.json(newUrl);
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = Number(req.params.short_url);

  const foundUrl = urls.find(item => item.short_url === shortUrl);

  if (!foundUrl) {
    return res.json({ error: 'No short URL found' });
  }

  res.redirect(foundUrl.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});