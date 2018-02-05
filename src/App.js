import React, { Component } from 'react';
import './App.css';
import { observer } from 'mobx-react';
import UI from './states/ui';
import Map from './containers/Map';

class App extends Component {
  constructor(props, context) {
    super(props, context);

    this.ui = new UI();
  }

  onSelect(value) {
    this.ui.selected = value;
  }

  render() {
    return (
      <div className="App">
        <div>
          <select onChange={(event) => this.onSelect(event.target.value)}>
              {this.ui.options.map((option, index) => (<option key={index} value={option}>{option}</option>))}
          </select>
        </div>
        <Map
            points={this.ui.points}
        />
      </div>
    );
  }
}

export default observer(App);
