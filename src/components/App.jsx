import '../styles/main.scss';
import { Component } from 'react';

import * as Flipnote from 'flipnote.js';
import { Index } from './Index';
import { ExportPanel } from './ExportPanel';

// console.log(Flipnote)

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showExportPanel: false,
    };
    this.player = new Flipnote.Player(document.createElement('canvas'));
    this.player.on('load', () => {
      const type = this.player.noteFormat;
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
    this.player.load(source);
  }

  unloadFlipnote() {
    this.player.closeNote()
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