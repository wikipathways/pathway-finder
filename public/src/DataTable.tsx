import { defaults, forOwn } from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";

// TODO should we use the theme provider here?
//import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import StarterDataTable from "material-ui-datatables";
import { multiSort } from "./sort";

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  // TODO add the rest
}

export class DataTable extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = defaults(
      {
        sortCriteria: [],
        // TODO showRowSizeControls cannot currently be disabled. Below does not work:
        //showRowSizeControls: false,
        onRowSizeChange: this.handleOnRowSizeChange,
        rowSize: 10,
        rowSizeList: [10, 30, 50, 100],
        onNextPageClick: this.handleNextPageClick,
        onPreviousPageClick: this.handlePreviousPageClick,
        onSortOrderChange: this.handleSortOrderChange
      },
      props,
      {
        selectedRows: [0],
        height: "auto",
        onCellClick: this.handleCellClick,
        onRowSelection: this.handleRowSelection,
        page: 1
      }
    );
  }

  componentDidMount = () => {
    const { selectedRows } = this.state;
    this.handleRowSelection(selectedRows);
  };

  componentWillReceiveProps = nextProps => {
    const that = this;
    const prevProps = this.props;
    const propsToUpdate = ["data", "count"];
    forOwn(nextProps, function(prop, key) {
      if (propsToUpdate.indexOf(key) > -1) {
        that.setState({
          [key]: prop
        });
      }
    });
  };

  handleOnRowSizeChange = rowSizeListIndex => {
    const { rowSizeList } = this.state;
    this.setState({
      rowSize: rowSizeList[rowSizeListIndex]
    });
  };

  handleSortOrderChange = (key, direction) => {
    const { data, sortCriteria } = this.state;
    const newSortCriteria = [{ key, direction }].concat(
      sortCriteria.filter(so => so.key !== key)
    );

    // Can we just sort the data here, or do we
    // need to pass this change up to the parent
    // instead or in addition?
    this.setState({
      data: this.state.data.sort(multiSort.bind(undefined, newSortCriteria)),
      sortCriteria: newSortCriteria
    });
  };

  handleFilterValueChange = value => {
    //console.log('filter value: ' + value);
  };

  handleCellClick = (rowIndex, columnIndex, row, column) => {
    //console.log('selectedCell:');
    //console.log('DataTable: rowIndex: ' + rowIndex + ' columnIndex: ' + columnIndex);
  };

  handleCellDoubleClick = (rowIndex, columnIndex, row, column) => {
    //console.log('rowIndex: ' + rowIndex + ' columnIndex: ' + columnIndex);
  };

  handleRowSelection = (selectedRows: number[]) => {
    const { props, state } = this;
    const { data, page, rowSize } = state;
    // NOTE
    // page: 1-based
    // rows: 0-based
    this.setState({ selectedRows: selectedRows });
    // TODO: this.handleRowSelection is for multiple rows,
    // but props.handleRowSelection is for just one.
    // How to best handle this mismatch?
    const selectedRow = selectedRows[0];
    if (props.hasOwnProperty("handleRowSelection")) {
      props.handleRowSelection(
        selectedRows.map(
          rowIndex => this.state.data[(page - 1) * rowSize + rowIndex]
        )
      );
    }
  };

  handlePreviousPageClick = () => {
    const { count, data, page, rowSize } = this.state;
    const newPage = Math.max(page - 1, 1);
    this.setState({
      page: newPage
    });
  };

  handleNextPageClick = () => {
    const { count, data, page, rowSize } = this.state;
    const lastPage = Math.ceil((count || data.length) / rowSize);
    const newPage = Math.min(page + 1, lastPage);
    this.setState({
      page: newPage
    });
  };

  render() {
    const props = this.props;
    const state = this.state;
    const { data, page, rowSize } = state;

    const pageData = data.slice((page - 1) * rowSize, page * rowSize);
    const starterDataTableProps = defaults(
      { data: pageData, count: data.length },
      state
    );
    return <StarterDataTable {...starterDataTableProps} />;
  }
}
