"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var lodash_1 = require("lodash");
var React = require("react");
require("rxjs/add/observable/dom/ajax");
require("rxjs/add/operator/do");
require("rxjs/add/operator/let");
require("rxjs/add/operator/map");
var MuiThemeProvider_1 = require("material-ui/styles/MuiThemeProvider");
var TextField_1 = require("material-ui/TextField");
//import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
//import FlatButton from 'material-ui/FlatButton';
var RaisedButton_1 = require("material-ui/RaisedButton");
var queryString = require("query-string");
var injectTapEventPlugin = require("react-tap-event-plugin");
var DataTable_1 = require("./DataTable");
var TargetHighlighter_1 = require("./TargetHighlighter");
var mobx_1 = require("mobx");
var mobx_react_1 = require("mobx-react");
var geneToPathways = require('../gene-to-pathways.json');
var miRNAToTargets = require('../miRNA-to-targets.json');
var pathwayDetails = require('../pathway-details.json');
// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
var SAMPLE_ID_TO_LABEL_MAPPING = {
    '4144': 'MAT2A',
    '27430': 'MAT2B'
};
var styles = {
    block: {
        maxWidth: 250
    },
    radioButton: {
        marginBottom: 16
    }
};
function singleSort(direction, a, b) {
    if (a < b) {
        return direction === 'ASC' ? 1 : -1;
    }
    else if (a > b) {
        return direction === 'ASC' ? -1 : 1;
    }
    else {
        return 0;
    }
}
function multiSort(direction, bys, a, b) {
    return bys.reduce(function (acc, by) {
        return acc !== 0 ? acc : singleSort(direction, a[by], b[by]);
    }, 0);
}
var PathwayStore = (function () {
    function PathwayStore() {
        this.id = Math.random();
        this.elements = [];
        this.organism = '';
        this.name = '';
    }
    return PathwayStore;
}());
__decorate([
    mobx_1.observable
], PathwayStore.prototype, "elements");
__decorate([
    mobx_1.observable
], PathwayStore.prototype, "organism");
__decorate([
    mobx_1.observable
], PathwayStore.prototype, "name");
var PathwayFinderStore = (function () {
    function PathwayFinderStore(_a) {
        var id = _a.id, _b = _a.customStyle, customStyle = _b === void 0 ? {} : _b;
        var _this = this;
        this.id = Math.random();
        this.getDataFromPathwaysMiRNAsTargets = function (pathwaysMiRNAsTargets) {
            return lodash_1.toPairs(pathwaysMiRNAsTargets)
                .map(function (_a) {
                var pathway = _a[0], pathwayItems = _a[1];
                var targetGroups = lodash_1.values(pathwayItems);
                return {
                    pathway: pathway,
                    pathwayName: pathwayDetails[pathway],
                    miRNACount: targetGroups.length,
                    targetCount: lodash_1.flatten(targetGroups).length
                };
            })
                .sort(multiSort.bind(undefined, 'ASC', ['miRNACount', 'targetCount', 'pathway']));
        };
        this.getPathwaysMiRNAsTargetsFromIdentifiers = function (identifiers) {
            return identifiers.reduce(function (acc, identifier) {
                var targets = miRNAToTargets[identifier];
                if (!!targets) {
                    targets.forEach(function (target) {
                        var pathways = geneToPathways[target];
                        if (!!pathways) {
                            pathways.forEach(function (pathway) {
                                acc[pathway] = acc[pathway] || {};
                                acc[pathway][identifier] = acc[pathway][identifier] || [];
                                acc[pathway][identifier] = lodash_1.union(acc[pathway][identifier], [target]);
                            });
                        }
                    });
                }
                return acc;
            }, {});
        };
        this.customStyle = customStyle;
        var parsedQS = queryString.parse(location.search);
        if (!lodash_1.isEmpty(parsedQS)) {
            var identifiers = this.identifiers = (parsedQS.identifiers || '').split(',');
            if (!lodash_1.isEmpty(identifiers)) {
                var pathwaysMiRNAsTargets = this.pathwaysMiRNAsTargets = this.getPathwaysMiRNAsTargetsFromIdentifiers(identifiers);
                if (!lodash_1.isEmpty(pathwaysMiRNAsTargets)) {
                    this.data = this.getDataFromPathwaysMiRNAsTargets(pathwaysMiRNAsTargets);
                }
            }
            this.database = parsedQS.database;
        }
        this.columns = [{
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
                sortable: true
            }, {
                key: 'miRNACount',
                label: 'miRNA Count',
                sortable: true,
                style: {
                    width: '100px'
                }
            }, {
                key: 'targetCount',
                label: 'Target Count',
                sortable: true,
                style: {
                    width: '100px'
                }
            }];
        this.pvjson = new PathwayStore();
        mobx_1.autorun(function () { return console.log(_this.data); });
    }
    return PathwayFinderStore;
}());
__decorate([
    mobx_1.observable
], PathwayFinderStore.prototype, "customStyle");
__decorate([
    mobx_1.observable
], PathwayFinderStore.prototype, "data");
__decorate([
    mobx_1.observable
], PathwayFinderStore.prototype, "database");
__decorate([
    mobx_1.observable
], PathwayFinderStore.prototype, "identifiers");
__decorate([
    mobx_1.observable
], PathwayFinderStore.prototype, "pathwaysMiRNAsTargets");
__decorate([
    mobx_1.observable
], PathwayFinderStore.prototype, "pvjson");
__decorate([
    mobx_1.observable
], PathwayFinderStore.prototype, "columns");
exports.PathwayFinderStore = PathwayFinderStore;
var PathwayFinder = (function (_super) {
    __extends(PathwayFinder, _super);
    function PathwayFinder() {
        var _this = _super.apply(this, arguments) || this;
        // TODO is this correct? Or should we use componentWillUpdate?
        _this.componentDidUpdate = function (prevProps, prevState) {
            var state = _this.state;
            if (JSON.stringify(prevState.pvjson) !== JSON.stringify(state.pvjson)) {
            }
        };
        _this.handleRowSelection = function (selected) {
            var pathwaysMiRNAsTargets = _this.state.pathwaysMiRNAsTargets;
            var selectedPathway = selected.pathway;
            var pathwayItems = pathwaysMiRNAsTargets[selectedPathway];
            var targetHighlighterData = lodash_1.toPairs(pathwayItems)
                .map(function (_a) {
                var key = _a[0], value = _a[1];
                return {
                    id: key,
                    children: value
                };
            });
            _this.setState({ targetHighlighterData: targetHighlighterData, selectedPathway: selectedPathway });
        };
        _this.submitQuery = function () {
            var store = _this.props.store;
            var identifiers = store.identifiers;
            var pathwaysMiRNAsTargets = store.getPathwaysMiRNAsTargetsFromIdentifiers(identifiers);
            var data = store.getDataFromPathwaysMiRNAsTargets(pathwaysMiRNAsTargets);
            //this.setState({data: data, pathwaysMiRNAsTargets: pathwaysMiRNAsTargets});
        };
        _this.handleControlClick = function (item) {
            // TODO fix this by using new Pvjs
            var labels = item.children.map(function (c) { return SAMPLE_ID_TO_LABEL_MAPPING[c]; });
            _this.setState({ labels: labels, selectedControl: item.id });
        };
        return _this;
    }
    PathwayFinder.prototype.render = function () {
        var that = this;
        var state = that.state;
        var columns = state.columns, data = state.data, targetHighlighterData = state.targetHighlighterData, pvjson = state.pvjson, id = state.id, identifiers = state.identifiers, customStyle = state.customStyle, selectedControl = state.selectedControl, selectedPathway = state.selectedPathway, labels = state.labels;
        var labelAttribute = labels.map(function (l) { return "&label[]=" + l; }).join('');
        return <MuiThemeProvider_1["default"]>
			<div>
				<div style={{
            display: 'flex',
            flexFlow: 'row'
        }}>
					

					<div style={{
            display: 'flex',
            flexFlow: 'column wrap'
        }}>
						<TextField_1["default"] hintText="Enter your inputs, one per line, e.g, hsa-miR-21-5p &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; hsa-miR-20a-5p" multiLine={true} rows={20} rowsMax={100} inputStyle={{
            backgroundColor: '#efefef'
        }} floatingLabelText="Inputs (one per line)" onChange={function (event, newValue) {
            that.setState({ identifiers: newValue.split('\n').filter(function (x) { return x !== ''; }) });
        }} defaultValue={!lodash_1.isEmpty(identifiers) ? identifiers.join('\n') : null}/>
						<RaisedButton_1["default"] style={{
            marginTop: '8px',
            marginBottom: '8px'
        }} onClick={this.submitQuery} label="Search"/>
					</div>

					{!data ? null :
            <DataTable_1.DataTable columns={columns} data={data} selectable={true} showCheckboxes={false} showRowHover={true} handleRowSelection={this.handleRowSelection}/>}
				</div>

				{!data ? null :
            <div style={{
                display: 'flex',
                flexFlow: 'row'
            }}>
							{!selectedPathway ? null :
                <iframe src={"http://www.wikipathways.org/wpi/PathwayWidget.php?id=" + selectedPathway + "&label=" + labelAttribute + "&colors=red"} width="800px" height="400px" style={{ overflow: 'hidden' }}>
									</iframe>}
							{!!targetHighlighterData ? <TargetHighlighter_1.TargetHighlighter data={targetHighlighterData} onControlClick={this.handleControlClick} selected={selectedControl}/> : null}
							
						</div>}

			</div>
		</MuiThemeProvider_1["default"]>;
    };
    return PathwayFinder;
}(React.Component));
PathwayFinder = __decorate([
    mobx_react_1.observer
], PathwayFinder);
exports.__esModule = true;
exports["default"] = PathwayFinder;
/*
hsa-miR-21-5p
hsa-miR-21-3p
*/
