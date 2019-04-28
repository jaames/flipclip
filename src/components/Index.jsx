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
            A small utility to convert animations from Flipnote Studio or Flipnote Studio 3D into the Clipnote format.
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
      </div>
    </div>
  );
}