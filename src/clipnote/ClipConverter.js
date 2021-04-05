import JSZip from 'jszip';
import loadJs from 'load-js';

const VORBIS_ENCODER_PATH = process.env.NODE_ENV === 'production' ? process.env.PUBLIC_URL + '/lib/' : '/lib/';

const KWZ_PALETTE = [
  [255, 255, 255, 255],
  [  0,   0,   0, 255],
  [255,  23,  23, 255],
  [255, 230,   0, 255],
  [  0, 130,  50, 255],
  [  0,  60, 200, 255],
  [255, 255, 255, 0],
];

const PPM_PALETTE = [
  [255, 255, 255, 255],
  [  0,   0,   0, 255],
  [255,  23,  23, 255],
  [  0,  60, 200, 255],
];

export class ClipConverter {

  constructor(source) {
    // set up drawing canvas
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.ctx = ctx;
    this._hasLoadedVorbisLib = false;
    this.usePaper = true;
    this.frameColor = null;
    if (source) this.loadSource(source);
    window.exporter = this;
  }

  async init({ usePaper, frameColor }) {
    this.usePaper = usePaper;
    this.frameColor = frameColor;
    if (!this._hasLoadedVorbisLib) {
      await loadJs(VORBIS_ENCODER_PATH + 'libvorbis.min.js');
      this._hasLoadedVorbisLib = true;
      return true;
    } else {
      return true;
    }
  }

  // source should be a flipnote.js kwz or ppm parser instance
  async loadSource(source) {
    // set up output zip
    this.output = new JSZip();
    // clear current canvas content
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // set source attributes
    this.source = source;
    this.sourceType = source.format;
    if (this.sourceType === 'KWZ') {
      this.source.globalPalette = KWZ_PALETTE;
      this.sourceWidth = 320;
      this.sourceHeight = 240;
    } 
    else if (this.sourceType === 'PPM') {
      this.source.globalPalette = PPM_PALETTE;
      this.sourceWidth = 256;
      this.sourceHeight = 192;
    }
    // set up buffers
    this.pixelBuffer = new Uint32Array(this.sourceWidth * this.sourceHeight);
    this.palette = new Uint32Array(8);
    this.frame = null;
    // reset decoder context
    this._currentFrame = -1;
    return true;
  }

  // save .zip output
  // file content is based to callback
  finish(callback) {
    this.output.generateAsync({type:'blob'}).then(callback);
  }

  async writeMeta() {
    const source = this.source;
    const meta = source.meta;
    const ini = [
      `[user]`,
      `id="FLIPNOTE"`,
      `name="${meta.current.username}"`,
      `[data]`,
      `spinoff="${meta.current.fsid === meta.parent.fsid ? 0 : 1}"`,
      `locked="${meta.lock}"`,
      `framerate="${source.framerate}"`,
      `frame_max="${source.frameCount}"`,
      `replay="${meta.loop}"`
    ].join('\n');
    this.output.file('data.ini', ini);
    return true;
  }

  async writeThumb() {
    const thumbData = this.getFrameData(this.source.thumbFrameIndex);
    this.output.file('thumb.png', thumbData, {base64:true});
    return true;
  }

  writeAudio() {
    return new Promise((resolve, reject) => {
      const source = this.source;
      // if vorbis lib is loaded
      if (typeof window.VorbisEncoder !== 'undefined') {
        const sampleRate = source.sampleRate;
        const numChannels = 1;
        const quality = .75;
        // create decoder instance
        // https://github.com/Garciat/libvorbis.js
        const vorbis = new VorbisEncoder();

        var chunks = [];
          
        vorbis.ondata = (data) => {
          chunks.push(data);
        };

        vorbis.onfinish = () => {
          // output .ogg to zip
          const blob = new Blob(chunks, { type: 'audio/ogg' });
          this.output.file('sound.ogg', blob);
          resolve();
        };

        const pcmSamples = source.getAudioMasterPcm();
        const samples = new Float32Array(pcmSamples.length);
        // convet audio samples to float32, with range -1.0 to 1.0
        pcmSamples.forEach((sample, index) => {
          samples[index] = sample / 32767;
        });

        vorbis.init(numChannels, sampleRate, quality);
        vorbis.encode([samples.buffer], samples.length, numChannels);
        vorbis.finish();
      } else {
        resolve();
      }
    });
  }

  writeLayers(updateProgress) {
    const frameCount = this.source.frameCount;
    const layerCount = this.sourceType === 'KWZ' ? 3 : 2;
    const imageCount = frameCount * layerCount;

    // iteration loop
    let imageIndex = 0;
    const iteration = async (done) => {
      if (imageIndex >= imageCount) {
        // we're done!
        await updateProgress(100);
        done();
      } else {
        let frameIndex = Math.floor(imageIndex / layerCount);
        let layerIndex = imageIndex % layerCount;
        // write layer
        this.writeLayer(frameIndex, layerIndex);
        // calculate progress
        let progress = (imageIndex / imageCount) * 100;
        // continue on to the next iteration once the progress update callback is done
        await updateProgress(progress);
        imageIndex += 1;
        iteration(done);
      }
    }

    return new Promise((resolve, reject) => {
      // start iteration loop
      iteration(resolve);
    });
  }

  async writeLayer(frameIndex, layerIndex) {
    if (this.sourceType === 'PPM') {
      var layerOrder = [1, 0];
      var clipnoteLayerIndex = layerOrder.length - layerIndex - 1;
    }
    else if (this.sourceType === 'KWZ') {
      var layerOrder = this.source.getFrameLayerOrder(frameIndex).reverse();
      var clipnoteLayerIndex = layerOrder.length - layerIndex - 1;
      layerIndex = layerOrder[layerIndex];
    }
    // get layer PNG image data
    const layerData = this.getLayerData(frameIndex, layerIndex, this.usePaper && clipnoteLayerIndex === 0);
    // add layer image to zip
    this.output.file(`${frameIndex},${clipnoteLayerIndex}.png`, layerData, {base64:true});
    return true;
  }

  // load the palette for a given frame
  _loadFramePalette(frameIndex) {
    this.source.getFramePalette(frameIndex).forEach((color, index) => {
      // convert an array of r, g, b values to a single uint32 color
      const [r, g, b] = color;
      this.palette[index] = ((0xff << 24) | (b << 16) | (g << 8) | r);
    });
  }

  // blit pixelbuffer + get base64 png image data from canvas
  _pixelBufferToImageData() {
    // create imageData obj
    const imgData = new ImageData(new Uint8ClampedArray(this.pixelBuffer.buffer), this.sourceWidth, this.sourceHeight);
    // blit image data to canvas
    if (this.sourceType === 'PPM') {
      // ppms are 256 * 192, but clipnote's canvas is 320 * 240
      // so we just draw the ppm frame in the middle of the canvas with a blank border around it
      this.ctx.putImageData(imgData, 32, 24);
    } 
    else if (this.sourceType === 'KWZ') {
      this.ctx.putImageData(imgData, 0, 0);
    }
    // return the image data URL, but split it so it's just the base64 part
    return this.canvas.toDataURL().split(',')[1];
  }

  _clearPixelBuffer(clearColor=0) {
    this.pixelBuffer.fill(clearColor);
  }

  _clearCanvas(clearColor=null) {
    const intToHex = function(int) {
      return int.toString(16).padStart(2, '0');
    }
    if (clearColor) {
      if (Array.isArray(clearColor)) {
        // convert uint32 color to hex string
        let r = (clearColor) & 0xFF;
        let g = (clearColor >> 8) & 0xFF;
        let b = (clearColor >> 16) & 0xFF;
        let hexColor = '#' + intToHex(r) + intToHex(g) + intToHex(b);
        this.ctx.fillStyle = hexColor;
      } else if (typeof clearColor === 'string') {
        this.ctx.fillStyle = clearColor;
      }
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  getFrameData(frameIndex) {
    this._loadFramePalette(frameIndex);
    const framePixels = this.source.getFramePixels(frameIndex);
    // fill canvas with paper color
    this._clearCanvas(this.frameColor ? this.frameColor : this.palette[0]);
    // clear pixel buffer with paper color
    this._clearPixelBuffer(this.palette[0]);
    for (let index = 0; index < framePixels.length; index++) {
      let pixel = framePixels[index];
      if (pixel === 0) { // skip transparent pixels
        continue;
      } else {
        this.pixelBuffer[index] = this.palette[pixel];
      }
    }
    return this._pixelBufferToImageData();
  }

  getLayerData(frameIndex, layerIndex, isBottomLayer=false) {
    // get layer pixels
    this._loadFramePalette(frameIndex);
    const layer = this.source.getLayerPixels(frameIndex, layerIndex);
    // clear prev image
    if (isBottomLayer) {
      this._clearCanvas(this.frameColor ? this.frameColor : this.palette[0]);
      this._clearPixelBuffer(this.palette[0]);
    } else {
      this._clearCanvas();
      this._clearPixelBuffer();
    }
    // convert layer to rgba pixel buffer
    for (let index = 0; index < layer.length; index++) {
      let pixel = layer[index];
      if (pixel === 0) { // skip transparent pixels
        continue;
      } else {
        this.pixelBuffer[index] = this.palette[pixel];
      }
    }
    return this._pixelBufferToImageData();
  }

}