import '../styles/main.scss';
import { Component } from 'react';

import Flipnote from 'flipnote.js';
import { Index } from './Index';
import { ExportPanel } from './ExportPanel';

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showExportPanel: false,
    };
    this.player = new Flipnote.player(document.createElement('canvas'));
    this.player.on('load', () => {
      // disable smoothing
      this.player.setSmoothRendering(false);
      // use clipnote studio palette
      this.player.setPalette({
        WHITE:  [255, 255, 255],
        BLACK:  [  0,   0,   0],
        RED:    [255,  23,  23],
        YELLOW: [255, 230,   0],
        GREEN:  [  0, 130,  50],
        BLUE:   [  0,  60, 200],
        NONE:   [255, 255, 255],
      });
      const type = this.player.note.type;
      if (type === 'KWZ') {
        this.player.resize(320, 240);
      }
      else if (type === 'PPM') {
        this.player.resize(256, 192);
      }
      this.setState({
        showExportPanel: true
      });
    });
    window.flipnote = this.player;
  }

  handleFileUpload(files) {
    this.loadFlipnote(files[0]);
  }

  handleUrl(url) {
    this.loadFlipnote(url);
  }

  loadFlipnote(source) {
    this.setState({
      showExportPanel: false
    });
    this.player.open(source);
  }

  unloadFlipnote() {
    this.player.close()
    this.setState({showExportPanel: false})
  }

  render() {
    const { props, state } = this;
    return (
      <div className="Layout">
        {!state.showExportPanel && (
          <Index 
            onUpload={files => this.handleFileUpload(files)}
            onLoadUrl={url => this.handleUrl(url)}
          />
        )}
        {state.showExportPanel && (
          <ExportPanel
            onExit={() => this.unloadFlipnote()}
            player={this.player}
          />
        )}
      </div>
    );
  }
}