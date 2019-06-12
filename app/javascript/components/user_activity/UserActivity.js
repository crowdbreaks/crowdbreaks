// React
import React from 'react'
import { Bar, defaults } from 'react-chartjs-2';
import { Input, Col, Row, FormText, Table } from 'reactstrap';
let moment = require('moment');

export class UserActivity extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      labels: [],
      start_date: this.props.start_date,
      end_date: this.props.end_date,
      leaderboard: []
    };

    this.options = {
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'User activity',
        fontSize: 23,
        position: 'top',
        fontStyle: 'normal',
        fontColor: '#333333'
      },
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: "Answers"
          },
          ticks: {
            min: 0
          }
        }],
        xAxes: [{
          type: 'time',
          barPercentage: .8
        }]
      },
      elements: {
        rectangle: {
          borderSkipped: 'left'
        }
      },
      animation: false
    };
    defaults.global.defaultFontFamily = 'Roboto';
  }

  componentWillMount() {
    const data = {
      "user_activity": {
        "start_date": this.state.start_date,
        "end_date": this.state.end_date
      }
    };
    this.getData(data);
  }

  getData(data) {
    $.ajax({
      beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
      type: "GET",
      crossDomain: true,
      url: this.props.getUserActivityDataPath,
      data: data,
      dataType: "json",
      contentType: "application/json",
      success: (result) => {
        let labels = [];
        let counts = [];
        let dates = Object.keys(result['counts']);
        dates.sort();
        let data = Object.values(result['counts']);
        let fillDate = moment(this.state.start_date, 'YYYY-MM-DD');
        let currentDate;
        for (let i=0; i<dates.length; i++) {
          currentDate = moment(dates[i], 'YYYY-MM-DD');
          while (fillDate.isBefore(currentDate, 'day')) {
            labels.push(fillDate.format('YYYY-MM-DD HH:mm:ss'))
            counts.push(0)
            fillDate = fillDate.add(1, 'days');
          }
          labels.push(currentDate.format('YYYY-MM-DD HH:mm:ss'))
          counts.push(data[i])
          fillDate = fillDate.add(1, 'days');
        }
        if (labels.length > 0) {
          let lastDate = moment(labels[labels.length - 1])
          while (!lastDate.isSame(moment(this.state.end_date, 'YYYY-MM-DD'), 'day')) {
            lastDate = lastDate.add(1, 'days')
            labels.push(lastDate.format('YYYY-MM-DD HH:mm:ss'))
            counts.push(0)
          }
        }
        this.setState({
          labels: labels,
          data: counts,
          leaderboard: result['leaderboard']
        });
      }
    });
  }

  refresh() {
    let data = {
      "user_activity": {
        "start_date": this.state.start_date,
        "end_date": this.state.end_date
      }
    };
    this.getData(data);
  }

  handleChangeStart(event) {
    this.setState({
      start_date: event.target.value
    })
  }

  handleChangeEnd(event) {
    this.setState({
      end_date: event.target.value
    })
  }

  render() {
    const dateFormat = "YYYY-MM-DD";
    let data = {
      labels: this.state.labels,
      datasets: [{
        label: 'Answers',
        data: this.state.data,
        backgroundColor: '#1e9CeA'
      }]
    };

    let leaderboard_header = <thead><tr><th>#</th><th>Username</th><th>Email</th><th># Answers</th></tr></thead>;
    let leaderboard = <tbody>
      {this.state.leaderboard.map(function(row, i) {
        return <tr key={i} >
          <th scope="row">{i+1}</th>
          <td>{row[2]}</td>
          <td>{row[0]}</td>
          <td>{row[1]}</td>
        </tr>
      })}
      </tbody>;

    return(
      <div>
        <Row className="mb-4">
          <Col>
            <Row>
              <Col xs="12" md="6">
                <div className="form-group">
                  <label className="label-form-control">Start</label>
                  <Input type="text" name="start_date" onChange={(ev) => this.handleChangeStart(ev)} value={this.state.start_date}/>
                  <FormText color="muted">Format: {dateFormat}</FormText>
                </div>
              </Col>
              <Col xs="12" md="6">
                <div className="form-group">
                  <label className="label-form-control">End</label>
                  <Input type="text" name="end_date" onChange={(ev) => this.handleChangeEnd(ev)} value={this.state.end_date}/>
                  <FormText color="muted">Format: {dateFormat}</FormText>
                </div>
              </Col>
            </Row>
            <button className="btn btn-primary" onClick={() => this.refresh()}>Refresh</button>
          </Col>
        </Row>

        <Row className='mb-6'>
          <Col>
            <Bar data={data} height={250} options={this.options} />
          </Col>
        </Row>

        <Row>
          <Col>
            <h3 className="mb-4">Leaderboard</h3>
            <Table>
              {leaderboard_header}
              {leaderboard}
            </Table>
          </Col>
        </Row>
      </div>
    )
  }
}
