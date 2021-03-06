// React
import React from 'react'
import PropTypes from 'prop-types';
import { HorizontalBar, defaults } from 'react-chartjs-2';

defaults.global.defaultFontFamily = "'Roboto', sans-serif";
defaults.global.defaultFontColor = '#333';

export class MlPlayground extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoadingEndpointData: true,
      text: '',
      endpointData: [],
      labels: [],
      probabilities: [],
      currentEndpoint: '',
      durationMs: null
    };

    this.options = {
      maintainAspectRatio: false,
      animation: false,
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            min: 0,
            max: 1,
            stepSize: 0.2
          },
          scaleLabel: {
            display: true,
            labelString: "Probability",
          },
          gridLines: {
            display: true
          }
        }],
        yAxes: [{
          gridLines: {
            display: false
          }
        }]
      }
    };
  }

  componentDidMount() {
    this.getEndpoints(true)
  }

  getPrediction() {
    if (!this.state.currentEndpoint || !this.state.text) {
      return
    }
    const data = {
      'ml': {
        'text': this.state.text,
        'endpoint': this.state.currentEndpoint
      }
    }
    $.ajax({
      beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
      type: 'POST',
      url: this.props.predictMlModelsEndpoint,
      data: JSON.stringify(data),
      dataType: "json",
      contentType: "application/json",
      success: (data) => {
        let labels = [];
        let probabilities = [];
        let durationMs = null;
        if ('predictions' in data) {
          if (data['predictions'].length == 1) {
            let prediction = data['predictions'][0]
            if ('labels_fixed' in prediction && 'probabilities_fixed' in prediction) {
              labels = prediction['labels_fixed'];
              probabilities = prediction['probabilities_fixed'];
            } else if ('labels' in prediction && 'probabilities' in prediction) {
              labels = prediction['labels'];
              probabilities = prediction['probabilities'];
            }
            if ('duration_ms' in data) {
              durationMs = data['duration_ms'];
            }
          }
        }
        console.log(data);
        this.setState({
          labels: labels,
          probabilities: probabilities,
          durationMs: durationMs
        })
      }
    })
  }

  getEndpoints(useCache) {
    const data = {
      'ml': {
        'use_cache': useCache
      }
    }
    $.ajax({
      beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
      type: 'POST',
      url: this.props.listMlModelsEndpoint,
      data: JSON.stringify(data),
      dataType: "json",
      contentType: "application/json",
      success: (data) => {
        let endpointData = []
        let currentEndpoint = '';
        data.map((item, i) => {
          if (item['endpoint_status'] == 'InService') {
            endpointData.push({
              'question': item['tags']['question_tag'],
              'project': item['tags']['project_name'],
              'modelType': item['tags']['model_type'],
              'runName': item['tags']['run_name'],
              'name': item['model_name']
            })
          }
        })
        if (endpointData.length > 0) {
          currentEndpoint = endpointData[0]['name']
        }
        console.log(endpointData);
        this.setState({
          endpointData: endpointData,
          isLoadingEndpointData: false,
          currentEndpoint: currentEndpoint
        })
      }
    })
  }

  optionName(item) {
    return item['name'] + ' (' + item['project'] + ' - ' + item['question'] + ' - ' + item['runName'] + ')'
  }

  onTextChange(value) {
    this.setState({
      text: value
    }, () => {
      if (value) {
        this.getPrediction()
      }
    })
  }

  onSelectEndpoint(endpoint) {
    this.setState({
      currentEndpoint: endpoint
    }, () => {
      this.getPrediction();
    })
  }

  render() {
    let prevThis = this;
    let selectEndpoint;
    if (this.state.isLoadingEndpointData) {
      selectEndpoint = <div className='spinner-small'></div>
    } else {
      if (this.state.currentEndpoint) {
        // We have at least found one valid endpoint
        selectEndpoint = <select name="endpoint-select" value={this.state.currentEndpoint} className='select form-control mb-3' onChange={(e) => this.onSelectEndpoint(e.target.value)}>
        {this.state.endpointData.map((item, i) => {
          return <option key={i} value={item['name']}>{prevThis.optionName(item)}</option>
        })}
        </select>
      } else {
        selectEndpoint = <div className="alert alert-primary">No active endpoints could be found.</div>
      }
    }
    const data = {
      labels: this.state.labels,
      datasets: [
        {
          label: 'My First dataset',
          backgroundColor: '#1e9CeA',
          data: this.state.probabilities
        }
      ]
    };

    let barChart = <HorizontalBar data={data} height={200} options={this.options} />

    let input = <div className='form-group'>
      <label>Endpoints</label>
      {selectEndpoint}
    </div>
    let textarea = <textarea
            id="inputTextField"
            type="text"
            placeholder={'Type text here...'}
            disabled={!this.state.currentEndpoint}
            value={this.state.text}
            onChange={e => this.onTextChange(e.target.value)}
            className="form-control"
          />
    let inferenceTime = <div className='mt-2 text-light-sm'>
      <span>Inference time:&nbsp;</span>
      {this.state.durationMs && <span>{Math.round(this.state.durationMs * 100)/100}&nbsp;ms</span>}
    </div>

    return(
      <div>
        <div className="mb-2">
          {input}
          {textarea}
          {inferenceTime}
        </div>
        <div>
          {barChart}
        </div>
      </div>
    )
  }
}
