import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import axios from 'axios';
import jsonRefs from 'json-schema-ref-parser';
import './index.css';
import Path from './Path';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const getSearchParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleRun = this.handleRun.bind(this);
    this.state = {
      swaggerUrl: getSearchParam('swagger'),
      wiremockUrl: getSearchParam('wiremock'),
      definitionsState: {},
    };
    this.fetchSwaggerSpec();
  }

  sample(schema) {
    const typeSample = (type) => {
        const mapping = {
          'number': 0,
          'integer': 0,
        };
        return typeof mapping[type] !== 'undefined' ? mapping[type] : type;
    };

    if (!schema) {
      return;
    }

    if (!schema.properties) {
      return typeSample(schema.type);
    }

    return Object.keys(schema.properties)
    .reduce((accumulator, propertyName) => {
      const property = schema.properties[propertyName];
      return { ...accumulator, ...{[propertyName]: property.properties ? this.sample(property) : typeSample(property.type) } }
    }, {});
  }

  async fetchSwaggerSpec() {
    const { data } = await axios.get(this.state.swaggerUrl);
    const resolved = await jsonRefs.dereference(data);
    this.setState({ swaggerData: resolved })
  }

  get paths() {
    return Object.keys(this.state.swaggerData.paths);
  }

  sampleFor(path) {
    return this.sample(this.state.swaggerData.paths[path].get.responses['200'].schema);
  }

  async handleRun({ name, state }) {
    let response = {};
    try {
      this.setDefinitionState(name, { isLoading: true });
      const { data } = await axios.post(`${this.state.wiremockUrl}__admin/mappings`, {
        request : {
          method : 'GET',
          urlPathPattern : `${this.basePath}${name.replace(/\s*\{.*?\}\s*/g, '(.*)')}`
        },
        response : {
          status : 200,
          jsonBody : state,
        }
      });
      response.success = data;
    } catch (e) {
      response.error = e.response.data.error;
    }
    this.setDefinitionState(name, { isLoading: false, response });
  }

  handleChange(name, content) {
    this.setDefinitionState(name, { editorContent: content });
  }

  setDefinitionState(name, state) {
    const oldState = this.state.definitionsState[name];
    const newState = { ...oldState, ...state };
    this.setState({ definitionsState: { ...this.definitionsState, ...{ [name]: newState } } });
  }

  get basePath() {
    return this.state.swaggerData && this.state.swaggerData.basePath;
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className='App'>
          <h1 className="appTitle">Swagger to Wiremock</h1>
          <p>swagger: <a target="_blank" href={this.state.swaggerUrl}>{ this.state.swaggerUrl }</a></p>
          <p>wiremock: <a target="_blank" href={this.state.wiremockUrl}>{ this.state.wiremockUrl }</a></p>
          {this.basePath ?
            <p>base path: {this.basePath}</p>
            : null
          }
          {this.state.swaggerData ?
            this.paths.map((path) => (
              <Path
                key={path}
                path={path}
                onChange={this.handleChange}
                onRun={this.handleRun}
                responseSample={this.sampleFor(path)}
                {...this.state.definitionsState[path]}
              />
            ))
          : null }

        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
