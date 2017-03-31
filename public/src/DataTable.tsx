import { defaults, forOwn } from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// TODO should we use the theme provider here?
//import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import StarterDataTable from 'material-ui-datatables';
 
export class DataTable extends React.Component<any, any> {
  constructor(props) {
    super(props);
		this.state = defaults({
			onNextPageClick: this.handleNextPageClick,
			onPreviousPageClick: this.handlePreviousPageClick,
			onSortOrderChange: this.handleSortOrderChange,
		}, props, {
			selectedRows: [0],
			height: 'auto',
			onCellClick: this.handleCellClick,
			onRowSelection: this.handleRowSelection,
			page: 1,
			rowSize: 10,
		});
  }

	componentDidMount = () => {
		const {selectedRows} = this.state;
		this.handleRowSelection(selectedRows);
	}

	componentWillReceiveProps = (nextProps) => {
		const that = this;
		const prevProps = this.props;
		const propsToUpdate = ['data', 'count'];
		forOwn(nextProps, function(prop, key) {
			if (propsToUpdate.indexOf(key) > -1) {
				that.setState({
					[key]: prop
				});
			}
		});
	}

  handleSortOrderChange = (key, order) => {
    //console.log('key:' + key + ' order: ' + order);
  }

  handleFilterValueChange = (value) => {
    //console.log('filter value: ' + value);
  }

  handleCellClick = (rowIndex, columnIndex, row, column) => {
    //console.log('selectedCell:');
    //console.log('DataTable: rowIndex: ' + rowIndex + ' columnIndex: ' + columnIndex);
  }

  handleCellDoubleClick = (rowIndex, columnIndex, row, column) => {
    //console.log('rowIndex: ' + rowIndex + ' columnIndex: ' + columnIndex);
  }

  handleRowSelection = (selectedRows) => {
		const props = this.props;
    //console.log('selectedRows: ' + selectedRows);
		//console.log(this.state.data[selectedRows]);
		this.setState({selectedRows: selectedRows});
		if (props.hasOwnProperty('handleRowSelection')) {
			props.handleRowSelection(this.state.data[selectedRows]);
		}
  }

  handlePreviousPageClick = () => {
    //console.log('handlePreviousPageClick');
		const { count, data, page, rowSize } = this.state;
		const newPage = Math.max(page - 1, 1);
    this.setState({
      page: newPage,
    });
  }

  handleNextPageClick = () => {
    //console.log('handleNextPageClick');
		const { count, data, page, rowSize } = this.state;
		const lastPage = Math.ceil((count || data.length) / rowSize);
		const newPage = Math.min(page + 1, lastPage);
    this.setState({
      page: newPage,
    });
  }

  render() {
		const props = this.props;
		const state = this.state;
		const {data, page, rowSize} = state;

		const pageData = data.slice((page - 1) * rowSize, page * rowSize);
		const starterDataTableProps = defaults({data: pageData, count: data.length}, state);
    return <StarterDataTable {...starterDataTableProps}	/>;
  }
}
