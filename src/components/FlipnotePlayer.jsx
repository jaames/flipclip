import { Component } from 'react';

export class FlipnotePlayer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      paused: true
    };
    this.props.player.on('playback:end', () => { this.onPlaybackEnd() });
  }

  componentDidMount() {
    this.player = this.props.player;
    this._canvasWrapper.appendChild(this.player.canvas.el);
  }

  componentWillUnmount() {
    this._canvasWrapper.removeChild(this.player.canvas.el);
    this.player = null;
  }

  play() {
    const { player } = this;
    player.play();
    this.setState({
      paused: player.paused,
    });
  }

  pause() {
    const { player } = this;
    player.pause(); 
    this.setState({
      paused: player.paused,
    });
  }

  togglePlay() {
    if (this.state.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  onPlaybackEnd() {
    this.setState({paused: true});
  }

  render() {
    const { props, state } = this;
    return (
      <div className={`Player Player--${this.props.player.note.type.toLowerCase()}`}>
        <div className="Player__canvasBox">
          <div className="Player__canvas" ref={el => this._canvasWrapper = el}></div>
        </div>
        <div className="Player__controls">
          <i className="uil uil-backward" onClick={e => this.player.firstFrame()}></i>
          <i className="uil uil-step-backward" onClick={e => this.player.prevFrame()}></i>
          <i className={`uil uil-${state.paused ? 'play' : 'pause'}`} onClick={() => this.togglePlay()}></i>
          <i className="uil uil-skip-forward" onClick={e => this.player.nextFrame()}></i>
          <i className="uil uil-forward" onClick={e => this.player.lastFrame()}></i>
        </div>
      </div>
    );
  }

}