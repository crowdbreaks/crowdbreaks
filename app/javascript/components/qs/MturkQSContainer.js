// React
import React from 'react'

// Other
let humps = require('humps');
import { QSLogger } from './QSLogger';

// Components
import { QuestionSequence } from './QuestionSequence';
import { MturkFinal } from './MturkFinal';
import { Instructions } from './Instructions';

export class MturkQSContainer extends React.Component {
  constructor(props) {
    super(props);
    const {
      notification,
      questions,
      initialQuestionId,
      delayStart,
      delayNextQuestion,
    } = props;
    const showErrorNotification = !!notification && notification.status_code !== 'success';
    this.state = {
      questionSequenceHasEnded: false,
      errors: [],
      displayInstructions: false,
      numQuestionsAnswered: 0,
      currentQuestion: questions[initialQuestionId],
      showErrorNotification: showErrorNotification,
    };
    this.log = new QSLogger(delayStart, delayNextQuestion);
    this.results = [];
  }

  componentDidMount() {
    this.log.logMounted()
  }

  onAnswerSubmit(answerId, time) {
    // logging
    this.log.logResult(this.state.currentQuestion.id, time);
    // collect result data
    let resultData = humps.decamelizeKeys({
      result: {
        answerId: answerId,
        questionId: this.state.currentQuestion.id,
        userId: this.props.userId,
        tweetId: this.props.tweetId,
        projectId: this.props.projectId
      }
    });
    // store internally
    this.setState({
      numQuestionsAnswered: this.state.numQuestionsAnswered + 1
    })
    this.results.push(resultData);
  }

  onQuestionSequenceEnd(time) {
    // logging
    this.log.logFinal(time)
    this.setState({
      'questionSequenceHasEnded': true,
    });
  }

  gotoNextQuestion(nextQuestion) {
    // Go to next question
    this.setState({
      'currentQuestion': this.props.questions[nextQuestion],
    });
  }

  onMturkSubmit(time) {
    // Add final submit log
    this.log.logMturkSubmit(time);
    // Exit if in test mode
    if (this.props.testMode) {
      alert('No submit possible, since you are running in test mode.')
      return true;
    }
    let taskUpdate = humps.decamelizeKeys({
      task: {
        'workerId': this.props.workerId,
        'assignmentId': this.props.assignmentId,
        'tweetId': this.props.tweetId,
        'hitId': this.props.hitId,
        'results': this.results,
      }
    });
    taskUpdate['task']['logs'] = this.log.getLog();
    $.ajax({
      beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
      type: "POST",
      url: this.props.finalSubmitPath,
      data: JSON.stringify(taskUpdate),
      crossDomain: true,
      contentType: "application/json",
      success: () => {
        $('#submit-form').submit();
        return true;
      },
      error: (response) => {
        this.setState({
          errors: this.state.errors.concat([response.statusText])
        });
        // Give reward anyway (!)
        $('#submit-form').submit();
        return true;
      }
    });
  }

  getSubmitUrl() {
    const sandbox_prefix = this.props.sandbox ? 'workersandbox' : 'www';
    return "https://" + sandbox_prefix + ".mturk.com/mturk/externalSubmit";
  }

  onToggleInstructionDisplay() {
    this.setState({
      displayInstructions: !this.state.displayInstructions
    })
  }

  onRestart() {
    if (!this.props.allowReset) {
      alert('Reset not allowed.')
      return
    }
    if (confirm('Are you sure you want to restart the task? All previous answers given will be deleted.')) {
      if (!this.state.showErrorNotification) {
        this.log.logReset(this.state.currentQuestion.id);
        this.setState({
          currentQuestion: this.props.questions[this.props.initialQuestionId],
          numQuestionsAnswered: 0,
          questionSequenceHasEnded: false
        })
        this.results = [];
      }
    }
  }

  onTweetLoadError() {
    this.setState({
      errors: this.state.errors.concat(['Error when trying to load tweet. Ensure you disable browser plugins which may block this content.'])
    });
  }

  //// RENDER helpers
  onHelp() {
    window.location.href= 'mailto:'.concat(this.props.helpEmail,
      '?subject=Mturk worker question, hitId=', this.props.hitId)
  }
  getOptionButtons() {
    if (this.props.previewMode) {
      return;
    }
    return <div className='mb-5 buttons'>
      {this.props.allowReset && <button
          onClick={() => this.onRestart()}
          className='btn btn-secondary'>
          <i className='fa fa-refresh' style={{color: '#212529'}}></i>&emsp;{this.props.translations.general.restart}
        </button>}
      <button
        onClick={() => this.onHelp()}
        className='btn btn-secondary'>
        <i className='fa fa-question-circle' style={{color: '#212529'}}></i>&emsp;{this.props.translations.general.ask_for_help}
      </button>
    </div>
  }
  getPreviewText() {
    return <div>
      <p>Please accept the HIT to start working on it.</p>
    </div>
  }
  renderErrorNotification() {
    return <div className='row justify-content-center'>
      <div className='col-12 col-md-8 col-lg-6'>
        <h3>{this.props.notification.title_message}</h3>
        <p style={{color: "red"}}>{this.props.notification.message}</p>
      </div>
    </div>
  }
  getQuestionSequence() {
    if (this.props.previewMode) {
      return this.getPreviewText()
    }
    if (this.state.showErrorNotification) {
      return this.renderErrorNotification()
    }
    if (this.state.questionSequenceHasEnded) {
      return <MturkFinal
        onMturkSubmit={(event) => this.onMturkSubmit(event, new Date().getTime())}
        submitUrl={this.getSubmitUrl()}
        assignmentId={this.props.assignmentId}
        hitId={this.props.hitId}
      />
    }
    return <QuestionSequence
      ref={qs => {this.questionSequence = qs;}}
      questions={this.props.questions}
      currentQuestion={this.state.currentQuestion}
      transitions={this.props.transitions}
      tweetId={this.props.tweetId}
      tweetText={this.props.tweetText}
      onTweetLoadError={() => this.onTweetLoadError()}
      onQuestionSequenceEnd={(time) => this.onQuestionSequenceEnd(time)}
      onAnswerSubmit={(answerId, time) => this.onAnswerSubmit(answerId, time)}
      gotoNextQuestion={(nextQuestion) => this.gotoNextQuestion(nextQuestion)}
      numTransitions={0}
      captchaVerified={true}
      delayStart={this.props.delayStart}
      delayNextQuestion={this.props.delayNextQuestion}
      displayQuestionInstructions={true}
      numQuestionsAnswered={this.state.numQuestionsAnswered}
      translations={this.props.translations}
      colorOptions={this.props.colorOptions}
    />
  }

  render() {
    const title = this.props.mturkTitle && <h4 className="mb-4">
      {this.props.mturkTitle}
    </h4>;
    let mturkInstructions = <Instructions
      display={this.state.displayInstructions || this.props.previewMode}
      instructions={this.props.instructions}
      translations={this.props.translations.instructions}
      onToggleDisplay={() => this.onToggleInstructionDisplay()}
    />;
    const body = this.getQuestionSequence()
    const optionButtons = this.getOptionButtons()
    const errors = this.state.errors.length > 0 && <ul className='qs-error-notifications'>
      <li>Error:</li>
      {this.state.errors.map(function(error, i) {
        return <li key={i}>{error}</li>
      })}
    </ul>
    return(
      <div className="col-12 text-center" style={{paddingTop: '30px'}}>
        {title}
        {mturkInstructions}
        {optionButtons}
        {errors}
        {body}
      </div>
    );
  }
}
