import  UrlModel from '../models/Url.js';

const showHome = async (req, res) => {
  try {
  const urls = await UrlModel.find().sort({ createdAt: -1});
  res.render('home', { urls });
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).send('Internal Server Error');
  }
}

export { showHome };