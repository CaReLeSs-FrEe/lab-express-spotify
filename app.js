require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });


spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));



app.get('/', (req, res) => {
    res.render('Home.hbs');
});

app.get('/artist-search', async (req, res) => {
    try {
      const artist = req.query.artist || 'Lupe Fiasco'
      const data = await spotifyApi.searchArtists(artist)
      // console.log('The received data from the API: ', JSON.stringify(data.body, null, 2));
      const artistInformationCleanedUp = data.body.artists?.items?.map(oneArtist => {
        const randomImageIndex = Math.floor(Math.random() * oneArtist.images.length)
        return {
          name: oneArtist.name,
          image: oneArtist.images[randomImageIndex]?.url,
          artistId: oneArtist.id
        }
      })
      const info = {
        artist: artistInformationCleanedUp
      }
      // res.send(data.body) // to better visualize the data structure of the artist information
      res.render('artist-search-results.hbs', info);
    } catch (error) {
      console.log('The error while searching artists occurred: ', error);
    } 
});

app.get('/albums/:artistId', async (req, res, next) => {
  try {
    const artistId = req.params.artistId || '74D1UgRzMhTSPz698exXmR'
    console.log({ artistId: artistId })
    const data = await spotifyApi.getArtistAlbums(artistId)
    // console.log('The received data from the API: ', JSON.stringify(data.body, null, 2));
    const artistAlbums = data.body.items.map(oneAlbum => {
      console.log('One Album', oneAlbum)
      const randomImageIndex = Math.floor(Math.random() * oneAlbum.images.length)
      return {
        name: oneAlbum.name,
        cover: oneAlbum.images[randomImageIndex]?.url,
        id: oneAlbum.id
      }
    })
    res.render('albums.hbs', artistAlbums);
  } catch (error) {
    console.log('The error while searching albums occurred: ', error);
  } 
});

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
