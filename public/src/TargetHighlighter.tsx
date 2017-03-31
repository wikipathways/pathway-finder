import { defaults, forOwn } from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Subheader from 'material-ui/Subheader';
import RaisedButton from 'material-ui/RaisedButton';

/**
 * Show/hide targets of specified miRNAs.
 */
export class TargetHighlighter extends React.Component<any, any> {

	styles: any;
	data: any;

  constructor(props) {
    super(props);
    this.styles = {
      buttons: {
        margin: 4,
      },
      wrapper: {
        display: 'flex',
				flexFlow: 'column wrap',
      },
    };
  }

	handleClick = (item) => {
		const props = this.props;
		props.onControlClick(item);
	}

  renderButton(item) {
		const {selected} = this.props;
    return (
      <RaisedButton
        key={item.id}
        style={this.styles.buttons}
				label={item.id}
				primary={item.id === selected}
				onClick={this.handleClick.bind(this, item)}
      />
    );
  }

  render() {
		const {data} = this.props;
    return (
      <div style={this.styles.wrapper}>
				<Subheader>Select to highlight target(s)</Subheader>
        {data.map(this.renderButton, this)}
      </div>
    );
  }
}
