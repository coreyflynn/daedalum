"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var d3Ease = require("d3-ease");
var d3_interpolate_1 = require("d3-interpolate");
var d3_timer_1 = require("d3-timer");
/**
 * Wrapper component to handle animating child components. Passed in data are interpolated
 * over the specified duration and fed into the wrapped children as props. Note that children
 * are expected to extract relevant props from the passed in data.
 * @export
 * @class Daedalum
 * @extends {React.Component}
 */
var Daedalum = /** @class */ (function (_super) {
    tslib_1.__extends(Daedalum, _super);
    function Daedalum(props) {
        var _this = _super.call(this, props) || this;
        _this.interpolator = function () { };
        _this.ease = function () { };
        _this.queue = [];
        // Animation method
        _this.animationFunc = function (elapsed) {
            var step = elapsed / _this.props.duration;
            if (step >= 1) {
                _this.setState({ data: _this.interpolator(1), animating: false });
                if (_this.timer)
                    _this.timer.stop();
                _this.queue.shift();
                _this.traverseQueue();
                return;
            }
            _this.setState({
                data: _this.interpolator(_this.ease(step)),
                animating: true,
            });
        };
        // easing function to use when building animation steps
        _this.ease = d3Ease[props.easing];
        // Animation queue used to store pending animation steps
        _this.queue = Array.isArray(props.data) ? props.data.slice(1) : [];
        _this.state = {
            animating: false,
            data: Array.isArray(props.data) ? props.data[0] : props.data,
        };
        return _this;
    }
    // If there is an animation queue when the component mounts, make sure to traverse it
    Daedalum.prototype.componentDidMount = function () {
        if (this.queue.length)
            this.traverseQueue();
    };
    // when the component receives new props, reset the animation with new data and restart it
    Daedalum.prototype.componentWillReceiveProps = function (nextProps) {
        // cancel existing animation if there is one
        if (this.timer)
            this.timer.stop();
        // handle an object coming in through props by resetting the queue
        if (!Array.isArray(nextProps.data))
            this.queue = [nextProps.data];
        // handle an array coming in through props by extending the queue
        if (Array.isArray(nextProps.data))
            (_a = this.queue).push.apply(_a, nextProps.data);
        // start traversing the queue again
        this.traverseQueue();
        var _a;
    };
    // if there is an active animation when the component unmounts, stop it
    Daedalum.prototype.componentWillUnmount = function () {
        if (this.timer)
            this.timer.stop();
    };
    // Handles animation queue traversal
    Daedalum.prototype.traverseQueue = function () {
        // if there is anything in the queue traverse it
        if (this.queue.length) {
            // update the interplator
            this.interpolator = d3_interpolate_1.interpolateObject(this.state.data, this.queue[0]);
            this.timer = d3_timer_1.timer(this.animationFunc, this.props.delay);
        }
    };
    Daedalum.prototype.render = function () {
        return this.props.children(this.state.data, this.state.animating);
    };
    Daedalum.defaultProps = {
        duration: 300,
        delay: 0,
        easing: 'easeQuadInOut',
        data: {},
        children: function () { return React.createElement("div", null); },
    };
    return Daedalum;
}(React.Component));
exports.default = Daedalum;
