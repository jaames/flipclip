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
    this.player.setSmoothRendering(false);
    this.player.on('load', () => {
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
            onUpload={files => this.handleFileUpload(files)
          }/>
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