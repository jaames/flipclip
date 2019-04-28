import JSZip from 'jszip';

export class ClipExporter {

  constructor(source) {
    // set up drawing canvas
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    this.canvas = canvas;
    this.ctx = ctx;
    if (source) this.loadSource(source);
  }

  // source should be a flipnote.js kwz or ppm parser instance
  loadSource(source) {
    // set up output zip
    this.output = new JSZip();
    // clear current canvas content
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // set source attributes
    this.source = source;
    this.sourceType = source.type;
    if (this.sourceType === 'KWZ') {
      this.sourceWidth = 320;
      this.sourceHeight = 240;
    } 
    else if (this.sourceType === 'PPM') {
      this.sourceWidth = 256;
      this.sourceHeight = 192;
    }
    // set up buffers
    this.pixelBuffer = new Uint32Array(this.sourceWidth * this.sourceHeight);
    this.palette = new Uint32Array(8);
    this.frame = null;
    // reset decoder context
    this._currentFrame = -1;
  }

  // save .zip output
  // file content is based to callback
  save(callback) {
    this.output.generateAsync({type:'blob'}).then(callback);
  }

  writeMeta() {
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
  }

  writeThumb() {
    const thumbData = this.getFrameData(this.source.thumbFrameIndex);
    this.output.file('thumb.png', thumbData, {base64:true});
  }

  writeLayers(progressCallback) {
    const frameCount = this.source.frameCount;
    const layerCount = this.sourceType === 'KWZ' ? 3 : 2;
    const imageCount = frameCount * layerCount;
    // loop through frames
    for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
      // loop through layers
      for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
        // (in clipnote, 0 is the bottom layer...)
        let clipnoteLayerIndex = layerCount - layerIndex - 1;
        let layerData = this.getLayerData(frameIndex, clipnoteLayerIndex);
        this.output.file(`${frameIndex},${layerIndex}.png`, layerData, {base64:true});
        // figure out progres percentage
        let imageIndex = frameIndex * layerCount + layerIndex;
        let progress = (imageIndex / imageCount) * 100;
        if (progressCallback) progressCallback(progress);
      }
    }
  }

  // load the palette for a given frame
  _loadFramePalette(frameIndex) {
    this.source.getFramePalette(frameIndex).forEach((color, index) => {
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

  getFrameData(frameIndex) {
    this._loadFramePalette(frameIndex);
    const framePixels = this.source.getFramePixels(frameIndex);
    // clear pixel buffer with paper color
    this._clearPixelBuffer(this.palette[0]);
    for (let index = 0; index < framePixels.length; index++) {
      if (framePixels[index] === 0) { // skip transparent pixels
        continue;
      } else {
        this.pixelBuffer[index] = this.palette[framePixels[index]];
      }
    }
    return this._pixelBufferToImageData();
  }

  getLayerData(frameIndex, layerIndex) {
    // decode frame if it hasn't been decoded yet
    if (this._currentFrame !== frameIndex) {
      this.frame = this.source.decodeFrame(frameIndex);
      this._currentFrame = frameIndex;
      this._loadFramePalette(frameIndex);
    }
    // get layer pixels
    const layer = this.frame[layerIndex];
    // clear pixel buffer
    this._clearPixelBuffer();
    // handle ppm layer
    if (this.sourceType === 'PPM') {
      const layerColor = this.palette[layerIndex + 1];
      for (let index = 0; index < layer.length; index++) {
        let pixel = layer[index];
        // skip transparent pixel
        if (pixel === 0) {
          continue;
        } 
        else {
          this.pixelBuffer[index] = layerColor;
        }
      }
    }
    // handle kwz layer
    else if (this.sourceType === 'KWZ') {
      // cast layer as uint16 array
      const layerPixels = new Uint16Array(layer.buffer);
      const paletteOffset = 1 + (layerIndex * 2);
      for (let index = 0; index < layerPixels.length; index++) {
        let pixel = layerPixels[index];
        // transparent (skip)
        if (pixel === 0) {
          continue;
        }
        // layer color 1
        else if (pixel & 0xff00) {
          this.pixelBuffer[index] = this.palette[paletteOffset];
        }
        // layer color 2
        else if (pixel & 0x00ff) {
          this.pixelBuffer[index] = this.palette[paletteOffset + 1];
        }
      }
    }
    
    return this._pixelBufferToImageData();
  }

}