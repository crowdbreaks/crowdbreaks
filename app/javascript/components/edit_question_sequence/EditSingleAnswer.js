import React from 'react'

export class EditSingleAnswer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      answer: props.answer,
      color: props.color,
      label: props.label,
      tag: props.tag,
      answer_type: props.answer_type
    };
  }

  onUpdateAnswer(e) {
    this.setState({answer: e.target.value})
  }

  onUpdateLabel(e) {
    this.setState({label: e.target.value})
  }

  onUpdateAnswerType(e) {
    this.setState({answer_type: e.target.value})
  }

  onUpdateTag(e) {
    if (/^[a-z0-9-_]*$/.test(e.target.value) && e.target.value.length < 50) {
      this.setState({tag: e.target.value})
    }
  }

  onUpdateColor(e) {
    this.setState({color: e.target.value})
  }

  onUpdate() {
    this.props.onUpdateInternalAnswer(
      {
        answerPos: this.props.answerPos,
        label: this.state.label,
        color: this.state.color,
        answer: this.state.answer,
        tag: this.state.tag,
        answer_type: this.state.answer_type
      }
    )
  }

  render() {
    const componentsStyle = {display: 'inline-block', marginRight: '10px', marginBottom: '10px'}
    const idStyle = {...componentsStyle, width: '3%'}
    const answerStyle = {...componentsStyle, width: '30%'}
    const answerTypeStyle = {...componentsStyle, width: '10%'}
    const tagStyle = {...componentsStyle, width: '15%'}
    const selectStyle = {...componentsStyle, width: '10%'}
    const buttonStyle = {margin: '10px 10px 10px 0px', color: 'white'}

    let updateButton = <button
      className='btn btn-primary'
      style={buttonStyle}
      onClick={() => this.onUpdate()}
      >OK</button>
    return (
      <div className='mb-4'>
        <div style={idStyle}>
          {this.props.answerId}
        </div>
        <div style={answerStyle}>
          <input
            value={this.state.answer}
            disabled={this.props.isEditable ? false : 'disabled'}
            placeholder={'<answer>'}
            onChange={(e) => this.onUpdateAnswer(e)}
            className='form-control'>
          </input>
        </div>
        <div style={answerTypeStyle}>
          <select
            className='form-control'
            value={this.state.answer_type}
            onChange={(e) => this.onUpdateAnswerType(e)}>
            {
              this.props.answerTypeOptions.map( (answerType, i) => {
                return(<option key={i} value={answerType}>{answerType}</option>)
              })
            }
          </select>
        </div>
        <div style={selectStyle}>
          <select
            className='form-control'
            value={this.state.color}
            onChange={(e) => this.onUpdateColor(e)}>
            {
              Object.keys(this.props.colorOptions).map( (label, i) => {
                return(<option key={i} value={label}>{label}</option>)
              })
            }
          </select>
        </div>
        <div style={selectStyle}>
          <select
            className='form-control'
            value={this.state.label}
            onChange={(e) => this.onUpdateLabel(e)}>
            {
              this.props.labelOptions.map( (label, i) => {
                return(<option key={i} value={label}>{label}</option>)
              })
            }
          </select>
        </div>
        <div style={tagStyle}>
          <input
            value={this.state.tag}
            onChange={(e) => this.onUpdateTag(e)}
            style={{fontFamily: 'monospace'}}
            placeholder={'<tag>'}
            className='form-control'>
          </input>
        </div>
        {updateButton}
        {this.props.isEditable && <button
          onClick={(e) => this.props.onDeleteAnswer(this.props.answerId, this.props.questionId, e)}
          style={buttonStyle}
          className="btn btn-negative">&#x2716;
        </button>}
      </div>
    );
  }
}
