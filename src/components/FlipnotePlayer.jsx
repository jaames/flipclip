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
    this._wasPlaying = false;
    this._canvasWrapper.appendChild(this.player.canvas.el);
  }

  componentWillUnmount() {
    this._canvasWrapper.removeChild(this.player.canvas.el);
    this._wasPlaying = false;
    this.player = null;
  }

  componentDidUpdate(prevProps) {
    const newProps = this.props;
    // if the player was disabled in the last update, pause playback
    if (prevProps.disabled === false && newProps.disabled === true) {
      this._wasPlaying = this.state.paused === false;
      this.pause();
    }
    // if the player was re-enabled in the last update, resume playback
    else if (prevProps.disabled === true && newProps.disabled === false && this._wasPlaying) {
      this.play();
    }
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
    const noteType = props.player.note.type.toLowerCase()
    return (
      <div className={`Player Player--${noteType} ${props.disabled ? 'disabled' : ''}`}>
        <div className="Player__canvasBox">
          <div className="Player__canvas" ref={el => this._canvasWrapper = el} style={{background: props.backgroundColor}}></div>
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