import { Component } from 'react';
import { FlipnotePlayer } from './FlipnotePlayer';

import { saveAs } from 'file-saver';
import { ClipExporter } from '../clipnote/ClipExporter';

const exporter = new ClipExporter();

const nextTick = function (fn) {
  setTimeout(fn, 0);
}

export class ExportPanel extends Component {
  constructor(props) {
    super(props);
    this.player = props.player;
    const meta = this.player.note.meta;
    this.state = {
      progress: 0,
      isConvertionInProgress: false,
      outputName: `${meta.current.filename}.clip`,
      userId: ''
    };

  }

  convertToFile() {
    this.setState({
      progress: 0,
      progressStatus: 'Converting...',
      isConvertionInProgress: true
    });
    // wrap  in settimeout so it doesn't block ui renders
    nextTick(() => {
      const filename = this.state.outputName.match(/(\S+)\.clip/);
      const filestem = filename ? filename[1] : 'note';
      exporter.loadSource(this.player.note);
      exporter.writeMeta();
      nextTick(() => {
        this.setState({progressStatus: 'Writing Frames...'});
      });
      exporter.writeLayers((progress) => {
        setTimeout(() => {
          this.setState({progress});
        })
      });
      nextTick(() => {
        this.setState({progressStatus: 'Writing Thumbnail...'});
      });
      exporter.writeThumb();
      exporter.save(content => {
        saveAs(content, `${filestem}.clip`);
        this.setState({
          progress: 0,
          progressStatus: 'Done!',
          isConvertionInProgress: false
        });
      });
    });
    
  }

  render() {
    const { props, state } = this;
    const meta = this.player.note.meta;

    return (
      <div className="Card Card--exportPanel">
        <div className="Card__head Nav">
          <a className="Nav__left" onClick={e => this.props.onExit()}>
            <i className="uil uil-arrow-left"></i>Return
          </a>
          <span className="Nav__title">Export</span>
          <span className="Nav__right"></span>
        </div>
        <div className="Card__body">
          <label>Preview</label>
          <div className="FlipnoteInfo">
            <h3>Flipnote by {meta.current.username}</h3>
          </div>
          <FlipnotePlayer
            player={ this.player }
          />
          <div className="FormGroup">
            <div className="FormElement">
              <label htmlFor="outputName">Filename</label>
              <input
                className="Input TextInput"
                id="outputName"
                type="text"
                value={state.outputName}
                disabled={state.isConvertionInProgress}
                onChange={e => this.setState({outputName: e.target.value})}
              />
            </div>
            <button type="button" className="Button" onClick={e => {this.convertToFile()}}>
              Convert
            </button>
          </div>
        </div>
        <div className="Card__foot">
          <div className="Progress">
            <span className="Progress__status">{state.progressStatus}</span>
            <div className="Progress__bar">
              <div className="Progress__level" style={{width: `${state.progress}%`}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}