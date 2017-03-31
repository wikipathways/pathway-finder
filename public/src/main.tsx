import { defaults, flatten, forOwn, keys, isEmpty, omit, padStart, toPairs, union, values } from 'lodash';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observable } from 'rxjs/Observable';
import { AjaxRequest } from  'rxjs/observable/dom/AjaxObservable';
import 'rxjs/add/observable/dom/ajax';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/map';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
//import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
//import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import * as queryString from 'query-string';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import StarterDataTable from 'material-ui-datatables';
import {DataTable} from './DataTable';
import {TargetHighlighter} from './TargetHighlighter';

const geneToPathways = require('../gene-to-pathways.json');
const miRNAToTargets = require('../miRNA-to-targets.json');
const pathwayDetails = require('../pathway-details.json');

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();


const SAMPLE_ID_TO_LABEL_MAPPING = {
	'4144': 'MAT2A',
	'27430': 'MAT2B',
}

const styles = {
  block: {
    maxWidth: 250,
  },
  radioButton: {
    marginBottom: 16,
  },
};
 
declare type Direction = 'ASC' | 'DESC';

function singleSort(direction: Direction, a, b) {
	if (a < b) {
		return direction === 'ASC' ? 1 : -1;
	} else if (a > b) {
		return direction === 'ASC' ? -1 : 1;
	} else {
		return 0;
	}
}
 
function multiSort(direction: Direction, bys: string[], a, b) {
	return bys.reduce(function(acc, by) {
		return acc !== 0 ? acc : singleSort(direction, a[by], b[by]);
	}, 0);
}

class PathwayFinder extends React.Component<any, any> {
  constructor(props) {
		super(props);
		const customStyle = props.customStyle || {};

		const columns = [{
		/*
			key: 'pathway',
			label: 'ID',
			sortable: false,
			style: {
				width: '30px',
			},
		}, {
		//*/
			key: 'pathwayName',
			label: 'Pathway Name',
			sortable: true,
		}, {
			key: 'miRNACount',
			label: 'miRNA Count',
			sortable: true,
			style: {
				width: '100px',
			},
		}, {
			key: 'targetCount',
			label: 'Target Count',
			sortable: true,
			style: {
				width: '100px',
			},
		}];

		const parsed = queryString.parse(location.search);
		let identifiers;
		let database;
		let pathwaysMiRNAsTargets;
		let data;
		if (!isEmpty(parsed)) {
			identifiers = (parsed.identifiers || '').split(',');
			if (!isEmpty(identifiers)) {
				pathwaysMiRNAsTargets = this.getPathwaysMiRNAsTargetsFromIdentifiers(identifiers);
				if (!isEmpty(pathwaysMiRNAsTargets)) {
					data = this.getDataFromPathwaysMiRNAsTargets(pathwaysMiRNAsTargets);
				}
			}
			database = parsed.database;
		}

		this.state = {
			data: data,
			columns: columns,
			id: props.id,
			identifiers: identifiers,
			labels: [],
			pvjson: {
				elements: [],
				organism: '',
				name: '',
			},
			customStyle: props.customStyle,
			database: database,
			pathwaysMiRNAsTargets: pathwaysMiRNAsTargets,
		};
  }

	componentDidMount = () => {
	}

	// TODO is this correct? Or should we use componentWillUpdate?
	componentDidUpdate = (prevProps, prevState) => {
		const state = this.state;
		if (JSON.stringify(prevState.pvjson) !== JSON.stringify(state.pvjson)) {
		}
	}

	componentWillUnmount = () => {
		// cancel any pending network requests
	}	

	handleRowSelection = (selected) => {
		const {pathwaysMiRNAsTargets} = this.state;
		const selectedPathway = selected.pathway;
		const pathwayItems = pathwaysMiRNAsTargets[selectedPathway];
		const targetHighlighterData = toPairs(pathwayItems)
			.map(function([key, value]) {
				return {
					id: key,
					children: value,
				};
			});
		this.setState({targetHighlighterData: targetHighlighterData, selectedPathway: selectedPathway});
	}

	getDataFromPathwaysMiRNAsTargets = (pathwaysMiRNAsTargets) => {
		return toPairs(pathwaysMiRNAsTargets)
			.map(function([pathway, pathwayItems]) {
				const targetGroups = values(pathwayItems);
				return {
					pathway: pathway,
					pathwayName: pathwayDetails[pathway],
					miRNACount: targetGroups.length,
					targetCount: flatten(targetGroups).length,
				};
			})
			.sort(multiSort.bind(undefined, 'ASC', ['miRNACount', 'targetCount', 'pathway']));
	}

	getPathwaysMiRNAsTargetsFromIdentifiers = (identifiers) => {
		return identifiers.reduce(function(acc, identifier) {
			const targets = miRNAToTargets[identifier];
			if (!!targets) {
				targets.forEach(function(target) {
					const pathways = geneToPathways[target];
					if (!!pathways) {
						pathways.forEach(function(pathway) {
							acc[pathway] = acc[pathway] || {};
							acc[pathway][identifier] = acc[pathway][identifier] || [];
							acc[pathway][identifier] = union(acc[pathway][identifier], [target]);
						});
					}
				});
			}
			return acc;
		}, {});
	}

	submitQuery = () => {
		const {identifiers} = this.state;

		const pathwaysMiRNAsTargets = this.getPathwaysMiRNAsTargetsFromIdentifiers(identifiers);
		const data = this.getDataFromPathwaysMiRNAsTargets(pathwaysMiRNAsTargets);

		this.setState({data: data, pathwaysMiRNAsTargets: pathwaysMiRNAsTargets});
	}

	handleControlClick = (item) => {
		// TODO fix this by using new Pvjs
		const labels = item.children.map(c => SAMPLE_ID_TO_LABEL_MAPPING[c]);
		this.setState({labels: labels, selectedControl: item.id});
	}

  render() {
		let that = this;
		const state = that.state;
		const { columns, data, targetHighlighterData, pvjson, id, identifiers, customStyle, selectedControl, selectedPathway, labels } = state;
		const labelAttribute = labels.map(l => `&label[]=${l}`).join('');

		return <MuiThemeProvider>
			<div>
				<div style={{
					display: 'flex',
					flexFlow: 'row',
				}}>
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

					<div style={{
						display: 'flex',
						flexFlow: 'column wrap',
					}}>
						<TextField
								hintText="Enter your inputs, one per line, e.g, hsa-miR-21-5p &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; hsa-miR-20a-5p"
								multiLine={true}
								rows={20}
								rowsMax={100}
								inputStyle={{
									backgroundColor: '#efefef',
								}}
								floatingLabelText="Inputs (one per line)"
								onChange={function(event, newValue) {
									that.setState({identifiers: newValue.split('\n').filter(x => x !== '')});
								}}
								defaultValue={!isEmpty(identifiers) ? identifiers.join('\n') : null}
								/>
						<RaisedButton style={{
							marginTop: '8px',
							marginBottom: '8px',
						}}
						onClick={this.submitQuery}
						label="Search"
						/>
					</div>

					{
						!data ? null :
							<DataTable columns={columns}
								data={data}
								selectable={true}
								showCheckboxes={false}
								showRowHover={true}
								handleRowSelection={this.handleRowSelection}
							/>
					}
				</div>

				{
					!data ? null :
						<div style={{
							display: 'flex',
							flexFlow: 'row',
						}}>
							{
								!selectedPathway ? null :
									<iframe src={`http://www.wikipathways.org/wpi/PathwayWidget.php?id=${selectedPathway}&label=${labelAttribute}&colors=red`}
										width="800px"
										height="400px"
										style={{overflow:'hidden'}}>
									</iframe>
							}
							{
								!!targetHighlighterData ? <TargetHighlighter data={targetHighlighterData} onControlClick={this.handleControlClick} selected={selectedControl} /> : null
							}
							
						</div>
				}

			</div>
		</MuiThemeProvider>;
	}
}

export default PathwayFinder;
/*
hsa-miR-21-5p
hsa-miR-21-3p
*/
