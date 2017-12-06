import * as React from 'react';
import * as d3Ease from 'd3-ease';
import { interpolateObject } from 'd3-interpolate';
import { timer, Timer } from 'd3-timer';

interface Props {
  children(data: any | any[], animating: boolean): React.ReactNode;
  duration: number;
  delay: number;
  easing: string;
  data: Object | Object[];
}

interface State {
  animating: boolean;
  data: Object;
}

/**
 * Wrapper component to handle animating child components. Passed in data are interpolated
 * over the specified duration and fed into the wrapped children as props. Note that children
 * are expected to extract relevant props from the passed in data.
 * @export
 * @class Daedalum
 * @extends {React.Component}
 */
export default class Daedalum extends React.Component<Props, State> {
  interpolator: Function = () => {};
  timer?: Timer;
  ease: Function = () => {};
  queue: Object[] = [];

  static defaultProps: Props = {
    duration: 300,
    delay: 0,
    easing: 'easeQuadInOut',
    data: {},
    children: () => <div />,
  };

  constructor(props: Props) {
    super(props);
    // easing function to use when building animation steps
    this.ease = (d3Ease as { [k: string]: (t: number) => number })[
      props.easing
    ];

    // Animation queue used to store pending animation steps
    this.queue = Array.isArray(props.data) ? props.data.slice(1) : [];

    this.state = {
      animating: false,
      data: Array.isArray(props.data) ? props.data[0] : props.data,
    };
  }

  // If there is an animation queue when the component mounts, make sure to traverse it
  componentDidMount() {
    if (this.queue.length) this.traverseQueue();
  }

  // when the component receives new props, reset the animation with new data and restart it
  componentWillReceiveProps(nextProps: Props) {
    // cancel existing animation if there is one
    if (this.timer) this.timer.stop();

    // handle an object coming in through props by resetting the queue
    if (!Array.isArray(nextProps.data)) this.queue = [nextProps.data];

    // handle an array coming in through props by extending the queue
    if (Array.isArray(nextProps.data)) this.queue.push(...nextProps.data);

    // start traversing the queue again
    this.traverseQueue();
  }

  // if there is an active animation when the component unmounts, stop it
  componentWillUnmount() {
    if (this.timer) this.timer.stop();
  }

  // Handles animation queue traversal
  traverseQueue() {
    // if there is anything in the queue traverse it
    if (this.queue.length) {
      // update the interplator
      this.interpolator = interpolateObject(this.state.data, this.queue[0]);
      this.timer = timer(this.animationFunc, this.props.delay);
    }
  }

  // Animation method
  animationFunc = (elapsed: number) => {
    const step = elapsed / this.props.duration;

    if (step >= 1) {
      this.setState({ data: this.interpolator(1), animating: false });
      if (this.timer) this.timer.stop();
      this.queue.shift();
      this.traverseQueue();
      return;
    }
    this.setState({
      data: this.interpolator(this.ease(step)),
      animating: true,
    });
  };

  render() {
    return this.props.children(this.state.data, this.state.animating);
  }
}
