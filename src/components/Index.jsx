import { Component } from 'react';
import Dropzone from 'react-dropzone';

export const Index = function(props) {
  return (
    <div className="Card Card--introduction">
      <div className="Card__body">
        <header className="Hero">
          <h1 className="Hero__title">
            FlipClip
          </h1>
          <p className="Hero__sub">
            A small utility to convert animations from <a href="https://en.wikipedia.org/wiki/Flipnote_Studio">Flipnote Studio</a> or <a href="https://en.wikipedia.org/wiki/Flipnote_Studio_3D">Flipnote Studio 3D</a> into the <a href="https://calcium-chan.itch.io/clipnote">Clipnote</a> format.
          </p>
        </header>
        <Dropzone 
          className="Dropzone"
          accept={['.ppm', '.kwz']}
          onDrop={acceptedFiles => props.onUpload(acceptedFiles)}
        >
          {({getRootProps, getInputProps}) => (
            <section>
              <div {...getRootProps({className: 'Dropzone'})}>
                <input {...getInputProps()} />
                <p className="Dropzone__prompt">
                  Drag &amp; drop a Flipnote Studio .kwz or .ppm file here
                </p>
                <span className="Button Dropzone__button">
                  <i className='uil uil-file'></i>Browse Files
                </span>
              </div>
            </section>
          )}
        </Dropzone>
        <p>
          FlipClip was built by James Daniel (github, twitter) on top of the flipnote.js library. The source code is available on GitHub under the MIT license. I'm not affiliated with Flipnote Studio or Clipnote in any way, but I think they're both pretty neat. :)
        </p>
      </div>
    </div>
  );
}