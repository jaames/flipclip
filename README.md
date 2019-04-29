## FlipClip

A small utility to convert animations from [Flipnote Studio](https://en.wikipedia.org/wiki/Flipnote_Studio) or [Flipnote Studio 3D](https://en.wikipedia.org/wiki/Flipnote_Studio_3D) into the [Clipnote](https://calcium-chan.itch.io/clipnote) format.
         
### Features

* Supports animations from both versions of Flipnote Studio, in .ppm or .kwz format
* Converts frames and background music perfectly
* Live preview with interactive Flipnote player
* Works around Clipnote's background color limitation by filling the bottom layer with the Flipnote's paper color

### Todo

* Advanced conversion options like layer visibility, paper visibility, trimming, audio quality, etc
* Sound effect support -- this would require flipnote.js to have built-in audio resampling and mixing functionality, which would be quite a complex thing to implement
* Better error handling

### Built with

* [flipnote.js](https://github.com/jaames/flipnote.js) - My JavaScript library for browser-based playback and parsing of Flipnote animations.
* [react](https://reactjs.org/) - UI layer
* [unicons](https://iconscout.com/unicons?#start) - UI icons
* [libvorbis](https://github.com/Garciat/libvorbis.js) - .OGG Vorbis audio encoder library
* [jszip](https://stuk.github.io/jszip/) - the .clip format uses .zip as a container
* [poi](https://poi.js.org) - build tool

### Credits

* [jaames](https://github.com/jaames) - author
* [calcium](http://calciumchan.com/) - clipnote dev, provided helpful info about their animation format

### Building

Building requires Node and NPM to be installed

#### Install dependencies

```bash
npm install
```

#### Run devserver for testing

```bash
npm start
```

#### Create production build

Creates production files in `/dist`

```bash
npm run build
```