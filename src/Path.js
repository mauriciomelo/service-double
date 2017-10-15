/* eslint react/no-unused-prop-types: 0 */
/* eslint react/forbid-prop-types: 0 */
/* eslint react/require-default-props: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closebrackets';

const Path = (props) => {
  const name = props.path;
  const options = {
    mode: { name: 'javascript', json: true },
    tabSize: 2,
    smartIndent: true,
    theme: 'material',
    autoCloseBrackets: true,
  };

  const handleChange = (text) => {
    props.onChange(name, text);
  };

  const sanitizedEditorContent = () => {
    if (props.editorContent) {
      return props.editorContent.trim();
    }
    return '';
  };

  const handleRun = () => {
    const content = sanitizedEditorContent();
    const state = content ? JSON.parse(content) : props.responseSample;
    props.onRun({ name, state });
  };

  const Title = () => (
    <div className="definitionTitle">
      <span className="name">{name} </span>
    </div>
  );

  const sanitizedResponse = () => {
    if (!props.response) { return null; }
    const { error, success } = props.response;
    return JSON.stringify(success || error, null, 2);
  };

  const hasError = () => props.response && props.response.error;

  const isValid = (() => {
    try {
      if (sanitizedEditorContent()) {
        JSON.parse(sanitizedEditorContent());
      }
      return true;
    } catch (e) {
      return false;
    }
  })();

  const buttonLabel = () => {
    if (props.isLoading) {
      return 'running...';
    }

    if (!isValid) {
      return 'invalid';
    }

    return 'run';
  };

  const responseSample = props.responseSample ? JSON.stringify(props.responseSample, null, 2) : '';

  return (
    <Card className="definition">
      <CardHeader
        title={<Title />}
        actAsExpander
        showExpandableButton
      />
      <CardText style={{ padding: '0' }} expandable>
        <div className="cardContent">
          <h3>response</h3>
          <CodeMirror
            onChange={handleChange}
            options={options}
            defaultValue={responseSample}
          />

          {sanitizedResponse() ?
            <div>
              <h3>{hasError() ? 'error:' : 'success:'}</h3>
              <pre className={hasError() ? 'error' : 'success'}>
                { sanitizedResponse() }
              </pre>
            </div> : null
          }

        </div>
        <CardActions>
          <FlatButton
            className="error"
            primary
            disabled={!isValid || props.isLoading}
            label={buttonLabel()}
            onClick={handleRun}
          />
        </CardActions>
      </CardText>
    </Card>
  );
};

Path.propTypes = {
  path: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onRun: PropTypes.func.isRequired,
  response: PropTypes.any,
  isLoading: PropTypes.bool,
};

export default Path;
