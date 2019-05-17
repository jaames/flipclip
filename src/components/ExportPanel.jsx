import { Component } from 'react';
import { FlipnotePlayer } from './FlipnotePlayer';
import { ClipConverter } from '../clipnote/ClipConverter';

import { saveAs } from 'file-saver';
import Switch from 'react-toggle-switch';

const converter = new ClipConverter();

export class ExportPanel extends Component {
  constructor(props) {
    super(props);
    this.player = props.player;
    const meta = this.player.note.meta;
    this.state = {
      progress: 0,
      isConvertionInProgress: false,
      inputType: this.player.note.type,
      outputName: `${meta.current.filename}.clip`,
      userId: '',
      frameColor: '#ffffff',
      usePaper: true,
    };
  }

  setStateSynchronously(newState) {
    return new Promise(resolve => {
      this.setState(newState, () => {
        // react batches setState calls so resolution has to be delayed
        setInterval(resolve, 0);
      });
    });
  }

  async convert() {
    // don't do anything if convertion is already in progress
    if (this.state.isConvertionInProgress) {
      return null;
    }
    // everything has to be async so we can display progress status
    await this.setStateSynchronously({
      progress: 0,
      progressStatus: 'Preparing...',
      isConvertionInProgress: true
    });
    await converter.init({
      frameColor: this.state.frameColor,
      usePaper: this.state.usePaper
    });
    await converter.loadSource(this.player.note);
    await this.setStateSynchronously({
      progressStatus: 'Converting metadata...',
    });
    await converter.writeMeta()
    await this.setStateSynchronously({
      progressStatus: 'Converting audio...',
    });
    await converter.writeAudio()
    await this.setStateSynchronously({
      progressStatus: 'Converting frames...',
    });
    await converter.writeLayers(async (progress) => {
      await this.setStateSynchronously({progress});
    })
    await this.setStateSynchronously({
      progressStatus: 'Converting thumbnail...',
    });
    await converter.writeThumb();
    await this.setStateSynchronously({
      progress: 0,
      progressStatus: 'Done!',
      isConvertionInProgress: false
    });
    converter.finish(content => {
      const filename = this.state.outputName.match(/(\S+)\.clip/);
      const filestem = filename ? filename[1] : 'note';
      saveAs(content, `${filestem}.clip`);
    });
  }

  render() {
    const { props, state } = this;
    const meta = this.player.note.meta;

    return (
      <div className="Card Card--exportPanel">
        <div className="Card__head Nav">
          <a className="Nav__left" onClick={e => !state.isConvertionInProgress && props.onExit()}>
            <i className="uil uil-arrow-left"></i>Return
          </a>
          <span className="Nav__title">Convert</span>
          <span className="Nav__right"></span>
        </div>
        <div className="Card__body">
          <label>Preview</label>
          <div className="FlipnoteInfo">
            <h3>Flipnote by {meta.current.username}</h3>
          </div>
          <FlipnotePlayer
            backgroundColor= { state.frameColor }
            player={ this.player }
            disabled={ state.isConvertionInProgress }
          />
          <div className="FormGroup">
            { state.inputType === 'PPM' && (
              <div className="FormElement">
                <label htmlFor="frameColor">Frame color</label>
                <input
                  className="Input ColorInput"
                  id="frameColor"
                  type="color"
                  value={state.frameColor}
                  disabled={state.isConvertionInProgress}
                  onChange={e => this.setState({frameColor: e.target.value})}
                />
              </div>
            )}
            <div className="FormElement">
              <label htmlFor="usePaper">Use paper background</label>
              <Switch
                className="SwitchInput"
                onClick={e => this.setState({usePaper: !state.usePaper})}
                on={state.usePaper}
              />
            </div>
          </div>
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
            <button 
              type="button" 
              className="Button" 
              disabled={state.isConvertionInProgress} 
              onClick={e => this.convert()}
              >
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