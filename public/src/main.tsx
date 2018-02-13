import {
  defaults,
  flatten,
  forOwn,
  keys,
  isEmpty,
  omit,
  padStart,
  toPairs,
  union,
  values
} from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Observable } from "rxjs/Observable";
import { AjaxRequest } from "rxjs/observable/dom/AjaxObservable";
import "rxjs/add/observable/dom/ajax";
import "rxjs/add/operator/do";
import "rxjs/add/operator/let";
import "rxjs/add/operator/map";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import TextField from "material-ui/TextField";
//import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
//import FlatButton from 'material-ui/FlatButton';
import RaisedButton from "material-ui/RaisedButton";
import * as queryString from "query-string";
import StarterDataTable from "material-ui-datatables";
import { DataTable, Column } from "./DataTable";
import { TargetHighlighter } from "./TargetHighlighter";

import { autorun, computed, observable, IObservableArray, toJS } from "mobx";
import { observer } from "mobx-react";
import { fromStream } from "mobx-utils";

import { multiSort } from "./sort";

const geneToPathways = require("../gene-to-pathways.json");
const miRNAToTargets = require("../miRNA-to-targets.json");
const pathwayDetails = require("../pathway-details.json");

//*
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
import * as injectTapEventPlugin from "react-tap-event-plugin";
injectTapEventPlugin();
//*/

const SAMPLE_ID_TO_LABEL_MAPPING = {
  "4144": "MAT2A",
  "27430": "MAT2B"
};

const styles = {
  block: {
    maxWidth: 250
  },
  radioButton: {
    marginBottom: 16
  }
};

class PathwayStore {
  id = Math.random();
  @observable elements = [];
  @observable organism = "";
  @observable name = "";
}

export class PathwayFinderStore {
  id = Math.random();
  @observable customStyle: any;
  @observable database: string;
  @observable identifiers: string[];
  @observable pvjson: any;
  @observable columns: IObservableArray<Column>;
  @observable selectedPathway: any;
  @observable labels: string[] = [];
  @observable targetHighlighterSelected: any;
  constructor({ id, customStyle = {} }) {
    this.customStyle = customStyle;

    const parsedQS = queryString.parse(location.search);
    if (!isEmpty(parsedQS)) {
      const identifiers = (this.identifiers = (parsedQS.identifiers || "")
        .split(","));
      this.database = parsedQS.database;
    }

    this.columns = observable([
      {
        /*
			key: 'pathway',
			label: 'ID',
			sortable: false,
			style: {
				width: '30px',
			},
		}, {
		//*/
        key: "pathwayName",
        label: "Pathway Name",
        sortable: true
      },
      {
        key: "miRNACount",
        label: "miRNA Count",
        sortable: true,
        style: {
          width: "100px"
        }
      },
      {
        key: "targetCount",
        label: "Target Count",
        sortable: true,
        style: {
          width: "100px"
        }
      }
    ]);

    this.pvjson = new PathwayStore();

    //autorun(() => console.log(this.data));
  }

  @computed
  get pathwaysMiRNAsTargets() {
    return this.identifiers.reduce(function(acc, identifier) {
      const targets = miRNAToTargets[identifier];
      if (!!targets) {
        targets.forEach(function(target) {
          const pathways = geneToPathways[target];
          if (!!pathways) {
            pathways.forEach(function(pathway) {
              acc[pathway] = acc[pathway] || {};
              acc[pathway][identifier] = acc[pathway][identifier] || [];
              acc[pathway][identifier] = union(acc[pathway][identifier], [
                target
              ]);
            });
          }
        });
      }
      return acc;
    }, {});
  }

  @computed
  get data() {
    return (
      toPairs(this.pathwaysMiRNAsTargets)
        .map(function([pathway, pathwayItems]) {
          const targetGroups = values(pathwayItems);
          return {
            pathway: pathway,
            pathwayName: pathwayDetails[pathway],
            miRNACount: targetGroups.length,
            targetCount: flatten(targetGroups).length
          };
        })
        // TODO should this be handled by the DataTable initialSort property instead?
        .sort(
          multiSort.bind(undefined, [
            {
              key: "miRNACount",
              direction: "asc"
            },
            {
              key: "targetCount",
              direction: "asc"
            },
            {
              key: "pathway",
              direction: "asc"
            }
          ])
        )
    );
  }

  @computed
  get targetHighlighterData() {
    const { pathwaysMiRNAsTargets, selectedPathway } = this;
    const pathwayItems = pathwaysMiRNAsTargets[selectedPathway];
    return toPairs(pathwayItems).map(function([key, value]) {
      return {
        id: key,
        children: value
      };
    });
  }
}

@observer
class PathwayFinder extends React.Component<any, any> {
  store: any;
  constructor(props) {
    super(props);
    this.store = new PathwayFinderStore(props);
    this.state = {
      identifiers: this.store.identifiers
    };
  }

  handleRowSelection = selectedItems => {
    this.store.selectedPathway = selectedItems[0].pathway;
  };

  handleIdentifiersInputChange = (event, newValue) => {
    // TODO should we use Rx Observable with debounce?
    this.setState({ identifiers: newValue.split("\n").filter(x => x !== "") });
  };

  submitQuery = () => {
    this.store.identifiers = this.state.identifiers;
  };

  handleControlClick = item => {
    // TODO fix this by using new Pvjs
    this.store.labels = item.children.map(c => SAMPLE_ID_TO_LABEL_MAPPING[c]);
    this.store.targetHighlighterSelected = item.id;
  };

  render() {
    let that = this;
    const state = that.state;
    const store = that.store;
    const {
      columns,
      data,
      targetHighlighterData,
      pvjson,
      id,
      identifiers,
      customStyle,
      targetHighlighterSelected,
      selectedPathway,
      labels
    } = store;
    const labelAttribute = labels.map(l => `&label[]=${l}`).join("");

    return (
      <MuiThemeProvider>
        <div>
          <div
            style={{
              display: "flex",
              flexFlow: "row"
            }}
          >
            {/* // we only have one identifier at present, so this isn't needed
					<RadioButtonGroup name="inputType" defaultSelected="mirtarbase">
						<RadioButton
							value="mirtarbase"
							label="mirtarbase"
							style={styles.radioButton}
						/>
						<RadioButton
							value="ncbigene"
							label="Entrez Gene"
							style={styles.radioButton}
						/>
					</RadioButtonGroup>
					*/}

            <div
              style={{
                display: "flex",
                flexFlow: "column wrap"
              }}
            >

              <TextField
                hintText="Enter your inputs, one per line, e.g, hsa-miR-21-5p &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; hsa-miR-20a-5p"
                multiLine={true}
                rows={20}
                rowsMax={100}
                inputStyle={{
                  backgroundColor: "#efefef"
                }}
                floatingLabelText="Inputs (one per line)"
                onChange={this.handleIdentifiersInputChange}
                defaultValue={
                  !isEmpty(identifiers) ? identifiers.join("\n") : null
                }
              />

              <RaisedButton
                style={{
                  marginTop: "8px",
                  marginBottom: "8px"
                }}
                onClick={this.submitQuery}
                label="Search"
              />

            </div>

            {!data
              ? null
              : <DataTable
                  columns={toJS(columns)}
                  data={data}
                  selectable={true}
                  showCheckboxes={false}
                  showRowHover={true}
                  handleRowSelection={this.handleRowSelection}
                />}
          </div>

          {!data
            ? null
            : <div
                style={{
                  display: "flex",
                  flexFlow: "row"
                }}
              >
                {!selectedPathway
                  ? null
                  : <iframe
                      src={`https://www.wikipathways.org/wpi/PathwayWidget.php?id=${selectedPathway}&label=${labelAttribute}&colors=red`}
                      width="800px"
                      height="400px"
                      style={{ overflow: "hidden" }}
                    />}
                {!!targetHighlighterData
                  ? <TargetHighlighter
                      data={targetHighlighterData}
                      onControlClick={this.handleControlClick}
                      selected={targetHighlighterSelected}
                    />
                  : null}

              </div>}

        </div>
      </MuiThemeProvider>
    );
  }
}

export default PathwayFinder;
/*
hsa-miR-21-5p
hsa-miR-21-3p
*/
