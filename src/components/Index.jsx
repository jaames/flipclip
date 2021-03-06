import { Component } from 'react';
import Dropzone from 'react-dropzone';
import { resolveExternalUrl } from '../utils/resolveExternalUrl';

export class Index extends Component {

  constructor(props) {
    super(props);
    this.state = {
      flipnoteUrl: ''
    };
  }

  loadUrl() {
    let url = this.state.flipnoteUrl;
    if (url) {
      url = resolveExternalUrl(url);
      this.props.onLoadUrl(url);
    } 
  }

  render() {
    return (
      <div className="Card Card--introduction">
        <div className="Card__body">
          <header className="Hero">
            <h1 className="Hero__title">
              FlipClip
            </h1>
            <p className="Hero__sub">
              A small utility to convert animations from <a target="_blank" href="https://en.wikipedia.org/wiki/Flipnote_Studio">Flipnote Studio</a> or <a target="_blank" href="https://en.wikipedia.org/wiki/Flipnote_Studio_3D">Flipnote Studio 3D</a> into the <a target="_blank" href="https://calcium-chan.itch.io/clipnote">Clipnote</a> format.
            </p>
          </header>
          <Dropzone 
            className="Dropzone"
            accept={['.ppm', '.kwz']}
            onDrop={acceptedFiles => this.props.onUpload(acceptedFiles)}
          >
            {({getRootProps, getInputProps}) => (
              <section>
                <div {...getRootProps({className: 'Dropzone'})}>
                  <input {...getInputProps()} />
                  <p className="Dropzone__prompt">
                    Drag &amp; drop a Flipnote Studio .PPM or .KWZ file here
                  </p>
                  <span className="Button Dropzone__button">
                    <i className='uil uil-file'></i>Browse Files
                  </span>
                </div>
              </section>
            )}
          </Dropzone>
          <div className="FormGroup">
            <div className="FormElement">
              <label htmlFor="flipnoteUrl">Or paste a URL from <a target="_blank" href="https://gallery.kaeru.world/">Kaeru Gallery</a> or <a target="_blank" href="https://ipgflip.xyz">IPGFlip</a></label>
              <input
                className="Input TextInput"
                id="flipnoteUrl"
                type="text"
                value={this.state.flipnoteUrl}
                onChange={e => this.setState({flipnoteUrl: e.target.value})}
              />
            </div>
            <button 
              type="button" 
              className="Button" 
              onClick={e => this.loadUrl()}
              >
              Load
            </button>
          </div>
          <div className="Meta">
            Built by <a target="_blank" href="https://jamesdaniel.dev">James Daniel</a>, source code is on <a target="_blank" href="https://github.com/jaames/flipclip">GitHub</a>.
          </div>
        </div>
      </div>
    );
  }

}