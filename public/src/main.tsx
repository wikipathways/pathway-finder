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
  "10768": "AHCYL1",
  "10797": "MTHFD2",
  "1491": "CTH",
  "1719": "DHFR",
  //"1719": "MTHFD1L",
  "1786": "DNMT1",
  "1788": "DNMT3A",
  "1789": "DNMT3B",
  "191": "AHCY",
  "200895": "DHFRL1",
  "23382": "AHCYL2",
  "25902": "MTHFD1L",
  "26227": "PHGDH",
  "2729": "GCLC",
  "2730": "GCLM",
  "27430": "MAT2B",
  "275": "AMT",
  "2937": "GSS",
  "29947": "DNMT3L",
  "29968": "PSAT1",
  "4143": "MAT1A",
  "4144": "MAT2A",
  "441024": "MTHFD2L",
  "4522": "MTHFD1",
  "4524": "MTHFR",
  "4548": "MTR",
  "5723": "PSPH",
  "635": "BHMT",
  "6470": "SHMT1",
  "6472": "SHMT2",
  "7298": "TYMS",
  "875": "CBS",
  "998": "CDC42",
  "9855": "FARP2",
  "9564": "BCAR1",
  "9475": "ROCK2",
  "896": "CCND3",
  "894": "CCND2",
  "8711": "TNK1",
  "87": "ACTN1",
  "859": "CAV3",
  "858": "CAV2",
  "857": "CAV1",
  "85366": "MYLK2",
  "8516": "ITGA8",
  "8515": "ITGA10",
  "829662": "PIP3",
  "823": "CAPN1",
  "80310": "PDGFD",
  "7791": "ZYX",
  "7450": "VWF",
  "7448": "VTN",
  "7424": "VEGFC",
  "7423": "VEGFB",
  "7422": "VEGF",
  "7414": "VCL",
  "7409": "VAV1",
  "7408": "VASP",
  "7294": "TXK",
  "7148": "TNXB",
  "7143": "TNR",
  "71": "ACTG1",
  "7094": "TLN1",
  "7060": "THBS4",
  "7059": "THBS3",
  "7058": "THBS2",
  "7057": "THBS1",
  "673": "BRAF",
  "6725": "SRMS",
  "6714": "SRC",
  "6696": "SPP1",
  "6654": "SOS1",
  "6464": "SHC1",
  "6414": "SEPP1",
  "640": "BLK",
  "63923": "TNN",
  "6300": "MAPK12",
  "6093": "ROCK1",
  "60": "ACTB",
  "596": "BCL2",
  "595": "CCND1",
  "5908": "RAP1B",
  "5906": "RAP1A",
  "5894": "RAF1",
  "5881": "RAC3",
  "5880": "RAC2",
  "5879": "RAC1",
  "5829": "PXN",
  "5753": "PTK6",
  "5747": "PTK2",
  "5728": "PTEN",
  "572": "BAD",
  "57144": "PAK7",
  "56924": "PAK6",
  "5649": "RELN",
  "5608": "MAP2K6",
  "5607": "MAP2K5",
  "5606": "MAP2K3",
  "5605": "MAP2K2",
  "5604": "MAP2K1",
  "56034": "PDGFC",
  "5601": "MAPK9",
  "5599": "MAPK8",
  "5598": "MAPK7",
  "5597": "MAPK6",
  "5596": "MAPK4",
  "5594": "MAPK1",
  "55359": "STYK1",
  "53918": "PELO",
  "53358": "SHC3",
  "5296": "PIK3R2",
  "5295": "PIK3R1",
  "5294": "PIK3CG",
  "5293": "PIK3CD",
  "5291": "PIK3CB",
  "5290": "PIK3CA",
  "5228": "PGF",
  "5170": "PDPK1",
  "5159": "PDGFRB",
  "5156": "PDGFRA",
  "5155": "PDGFB",
  "5154": "PDGFA",
  "5063": "PAK3",
  "5062": "PAK2",
  "5058": "PAK1",
  "50509": "COL5A3",
  "4659": "PPP1R12A",
  "4638": "MYLK",
  "4637": "MYL6",
  "4233": "MET",
  "394": "ARHGAP5",
  "3918": "LAMC2",
  "3915": "LAMC1",
  "3914": "LAMB3",
  "3913": "LAMB2",
  "3912": "LAMB1",
  "3911": "LAMA5",
  "3910": "LAMA4",
  "3909": "LAMA3",
  "3908": "LAMA2",
  "388": "RHOB",
  "387": "RHOA",
  "3791": "KDR",
  "3725": "JUN",
  "3696": "ITGB8",
  "3695": "ITGB7",
  "3694": "ITGB6",
  "3693": "ITGB5",
  "3691": "ITGB4",
  "3690": "ITGB3",
  "369": "ARAF",
  "3689": "ITGB2",
  "3688": "ITGB1",
  "3687": "ITGAX",
  "3685": "ITGAV",
  "3684": "ITGAM",
  "3683": "ITGAL",
  "3682": "ITGAE",
  "3681": "ITGAD",
  "3680": "ITGA9",
  "3679": "ITGA7",
  "3678": "ITGA5",
  "3676": "ITGA4",
  "3675": "ITGA3",
  "3674": "ITGA2B",
  "3673": "ITGA2",
  "3655": "ITGA6",
  "3611": "ILK",
  "3480": "IGF1R",
  "3479": "IGF1",
  "3381": "IBSP",
  "3371": "TNC",
  "331": "BIRC4",
  "330": "BIRC3",
  "329": "BIRC2",
  "3265": "Ha-Ras",
  "30849": "PIK3R4",
  "3082": "HGF",
  "3055": "HCK",
  "29780": "PARVB",
  "2932": "GSK3B",
  "2889": "RAPGEF1",
  "2885": "GRB2",
  "284217": "LAMA1",
  "2534": "FYN",
  "23533": "PIK3R5",
  "23396": "PIP5K1C",
  "2335": "FN1",
  "2321": "FLT1",
  "2316": "FLNA",
  "22801": "ITGA11",
  "2277": "FIGF",
  "2268": "FGR",
  "208": "AKT2",
  "207": "AKT1",
  "2064": "ERBB2",
  "2002": "ELK1",
  "1956": "EGFR",
  "1950": "EGF",
  "1793": "DOCK1",
  "1729": "Diap1",
  "1499": "Catnb",
  "1398": "CRK",
  "1311": "COMP",
  "1302": "COL11A2",
  "1301": "COL11A1",
  "1292": "COL6A2",
  "1290": "COL5A2",
  "1289": "COL5A1",
  "1288": "COL4A6",
  "1286": "COL4A4",
  "1284": "COL4A2",
  "1282": "COL4A1",
  "1281": "COL3A1",
  "1280": "COL2A1",
  "1278": "COL1A2",
  "1277": "COL1A1",
  "1101": "CHAD",
  "10420": "TESK2",
  "10319": "LAMC3",
  "10298": "PAK4",
  "10188": "TNK2",
  "10000": "AKT3"
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
