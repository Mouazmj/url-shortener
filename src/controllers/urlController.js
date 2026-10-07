import  UrlModel from '../models/Url.js';
import validator from 'validator';
import crypto from 'crypto';

const showHome = async (req, res) => {
  try {
    const urls = await UrlModel.find({ _id: { $in: req.session.myUrls || [] } }).sort({ createdAt: -1 });
  res.render('home', { urls });
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).send('Internal Server Error');
  }
}

const createShortUrl = async (req, res) => {
try {
  const { originalUrl } = req.body;
  if (!validator.isURL(originalUrl, { require_protocol: true }) ) {
    req.session.flash = { type: 'error', message: 'Invalid URL. Please include the protocol (http:// or https://).' };
    return res.redirect('/');
  }

  let newUrl;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
       const shortUrl = crypto.randomBytes(4).toString('hex');
       newUrl = new UrlModel({ originalUrl, shortUrl });
       await newUrl.save();
       break;
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }

  if (newUrl.isNew) {
    throw new Error('Could not generate a unique short URL after multiple attempts.');
  }
  
  req.session.myUrls = [...(req.session.myUrls || []), newUrl._id];
  req.session.flash = { type: 'success', message: 'URL shortened successfully!' };
  res.redirect('/');
} catch (error) {
  console.error('Error creating short URL:', error);
  res.status(500).send('Internal Server Error');
}
}

const redirectToOriginal = async (req, res) => {
  try {
    const { code } = req.params;
    const urlEntry = await UrlModel.findOne({ shortUrl: code });
    if (!urlEntry) {
      res.status(404).send('Short URL not found');
    } else {
      res.redirect(urlEntry.originalUrl);
    }
  } catch (error) {
    console.error('Error redirecting to original URL:', error);
    res.status(500).send('Internal Server Error');
  }
}

export { showHome, createShortUrl, redirectToOriginal };