import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { WIDTH, HEIGHT } from './constants';

// genetic algo -- number of iterations
const ITERATIONS = 1000;
// how large is the population
const POPULATION = 1000;
// number of times to compete before moving on
const COMPETITIONS = 10;

function drawRect({ ctx, x, y }) {
    ctx.fillStyle = "#0e24aa";
    ctx.fillRect(x, y, 10, 10);
}

function drawLine({ ctx, start_x, start_y, end_x, end_y }) {
    ctx.beginPath();
    ctx.moveTo(start_x, start_y);
    ctx.lineTo(end_x, end_y);
    ctx.stroke();
}

function drawPoint({ ctx, x, y }) {
    ctx.beginPath();
    ctx.strokeStyle = "#11aa18";
    ctx.arc(x, y, 1, 0, 2*Math.PI);
    ctx.stroke();
}

function randomPath(length) {
    const path = [];
    for (let i = 0; i < length; i++) {
        path[i] = i;
    }
    return shuffle(path);
}


function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

function randomIndex(arr) {
    return Math.floor(arr.length * Math.random());
}


function contains(path, point, begin, end) {
    for (let i = begin; i <= end; i++) {
        if (path[i] === point) {
            return true;
        }
    }
    return false;
}

class Map extends Component {
    static propTypes = {
        points: PropTypes.array
    }

    constructor(props, context) {
        super(props, context);

        this.distances = this.calculateDistances(props.points);
    }

    calculateDistances(points) {
        const distances = [];
        const length = points.length;

        for(let i = 0; i < length; i++) {
            distances[i] = [];
        }

        for (let i = 0; i < length; i++) {
            for (let j = i; j < length; j++) {
                distances[i][j] = Math.sqrt((points[i].x - points[j].x) * (points[i].x
                    - points[j].x) + (points[i].y - points[j].y) * (points[i].y - points[j].y));
                distances[j][i] = distances[i][j];
            }
        }
        return distances;
    }

    componentDidMount() {
        this.updateCanvas();
    }

    // componentDidUpdate() {
    //     this.updateCanvas();
    // }

    componentWillReceiveProps(props) {
        this.props = props;
        this.distances = this.calculateDistances(props.points);
        this.updateCanvas();
    }

    updateCanvas() {
        this.drawPoints();
        this.drawPath();
    }

    drawPoints() {
        const { points } = this.props;
        const ctx = this.refs.canvas.getContext('2d');

        ctx.clearRect(0,0, WIDTH, HEIGHT);

        points.forEach((point, index) => {
            if(index === 0) {
                drawRect({ ctx, x: point.x, y: point.y });
            } else {
                drawPoint({ ctx, x: point.x, y: point.y});
            }
        })
    }

    drawPath() {
        const ctx = this.refs.canvas.getContext('2d');
        const path = this.getPath();
        const { points } = this.props;
        let start = points[0];

        path.forEach((index) => {
            const point = points[index];
            drawLine({ ctx, start_x: start.x, start_y: start.y, end_x: point.x, end_y: point.y});
            start = point;
        })
    }

    getPath() {
        return this.genetic();
    }

    genetic() {
        const {
            points
        } = this.props;

        let shortest_distance = Number.POSITIVE_INFINITY;
        let parents = [];
        let children;
        let path = points;
        let times_at_distance = 0;

        for(let i = 0; i < POPULATION; i++) {
            parents[i] = randomPath(points.length);
        }

        for(let i = 0; i < ITERATIONS; i++) {
            children = [];

            for(let j = 0; j < POPULATION; j++) {
                const parent_a = this.compete(parents);
                const parent_b = this.compete(parents);
                let child = this.breed(parents[parent_a], parents[parent_b]);

                children.push(child);
                const distance = this.getDistance(child);
                if(distance < shortest_distance) {
                    shortest_distance = distance;
                    path = child;
                } else if(distance === shortest_distance) {
                    times_at_distance++;

                    if(times_at_distance > COMPETITIONS) {
                        break;
                    }
                }
            }

            if(times_at_distance > COMPETITIONS) {
                break;
            }

            parents = children.slice(0);
        }

        // console.log("Distance: ", distance, shortest_distance);
        // console.log("PATH: ", path);

        return path;
    }

    // figure out the shortest of random paths
    compete(paths) {
        let winner;
        let shortest = Number.POSITIVE_INFINITY;

        for(let i = 0; i < COMPETITIONS; i++) {
            const random = randomIndex(paths);
            const randomDistance = this.getDistance(paths[random]);
            if(randomDistance < shortest) {
                shortest = randomDistance;
                winner = random;
            }
        }

        return winner;
    }

    // create a child from a mix of a and b
    breed(parent_a, parent_b) {
        const child = [];
        const index_a = {};
        const random_i = randomIndex(parent_a);
        const random_j = randomIndex(parent_a);
        const start = Math.min(random_i, random_j);
        const end = Math.max(random_i, random_j);

        for(let i = start; i <= end; i++) {
            child[i] = parent_a[i];
            index_a[parent_a[i]] = child[i];
        }
        // add everyhing else from parent_b to child
        let b = 0;
        for (let i = 0; i < parent_a.length; i++) {
            if (i >= start && i <= end) {
                continue;
            }
            while (contains(child, parent_b[b], start, end)) {
                b++;
            }
            child[i] = parent_b[b];
            b++;
        }

        return child;
    }

    getDistance(path) {
        const distances = this.distances;
        let d = distances[path[0]][path[path.length - 1]];
        // console.log("D :", d, path[0], path[path.length - 1], distances[path[0]][path[path.length - 1]]);
        for (let i = 1; i < path.length; i++) {
            // console.log("this.distances[path[i - 1]]", distances[path[i - 1]], path[i]);
            d += distances[path[i - 1]][path[i]];
        }
        return d;
    }

    render() {
        return (
            <canvas ref="canvas" width={WIDTH} height={HEIGHT}>
            </canvas>
        )
    }
}

export default Map;