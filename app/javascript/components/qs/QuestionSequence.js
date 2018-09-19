// React
import React from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { ClipLoader } from 'react-spinners';

// Other 
var humps = require('humps');
import moment from 'moment';

// Sub-components
import { Answer } from './Answer';
import { Question } from './Question';
import { QuestionInstructions } from './QuestionInstructions';
import { TweetEmbedding } from './TweetEmbedding';
import { TweetTextEmbedding } from './TweetTextEmbedding';

export class QuestionSequence extends React.Component {
  constructor(props) {
    super(props);
    if (!props.userSignedIn && !props.captchaVerified) {
      // Note: This could lead to problems if a user has multiple Question sequences in one window
      window.onCaptchaVerify = this.verifyCallback.bind(this);
    }
    // Only show loading clip if tweet is displayed using the Embedding API
    let showLoadingClip = props.tweetText == "" ? true : false;
    // set initial question state
    this.state = {
      'currentQuestion': props.questions[props.initialQuestionId],
      'tweetIsLoading': showLoadingClip,
      'showTweetText': !showLoadingClip,
      'numQuestionsAnswered': 0,
      'unverifiedAnswers': [],
      'answersDisabled': true,
      'showQuestionInstruction': false,
      'results': [],
      'logs': this.getInitializedLog(),
      'timeLastAnswer': null
    };
  }

  componentDidMount() {
    // Logging
    let newLog = this.state.logs;
    newLog['timeMounted'] = this.getTime();
    this.setState({
      'timeLastAnswer': this.getTime(),
      'logs': newLog
    })
    // Enable Answer delay at this moment in case of showing tweet text
    if (this.state.showTweetText) {
      this.delayEnableAnswers();
    }
  }

  getInitializedLog() {
    return {
      'timeInitialized': this.getTime(),
      'userTimeInitialized': moment().format(),
      'results': [],
      'resets': [],
      'answerDelay': this.props.enableAnswersDelay
    }
  }

  getTime() {
    return new Date().getTime();
  }

  restartQuestionSequence() {
    // logging
    let newLog = this.state.logs;
    newLog['resets'].push({
      'resetTime': this.getTime(),
      'resetAtQuestionId': this.state.currentQuestion.id,
      'previousResultLog': newLog['results']
    });
    newLog['results'] = [];

    this.setState({
      currentQuestion: this.props.questions[this.props.initialQuestionId],
      numQuestionsAnswered: 0,
      results: [],
      logs: newLog
    })
  }

  nextQuestion(currentQuestionId, answerId) {
    // case no transitions from current question Id -> end of question sequence
    if (!(currentQuestionId in this.props.transitions)) {
      return null;
    }

    var possible_transitions = this.props.transitions[currentQuestionId];
    // case 1 possible transition
    if (possible_transitions.length == 1) {
      // if answer === null -> allow transition irrespective of answerId
      if (possible_transitions[0].answer === null || possible_transitions[0].answer == answerId) {
        return possible_transitions[0].to_question;
      } else {
        // end of question sequence
        return null;
      }
    }

    // case multiple possible transitions -> check for matching answer
    for (var i=0; i < possible_transitions.length; i++) {
      if(possible_transitions[i].answer == answerId) {
        return possible_transitions[i].to_question;
      }
    }
    // no transitions were found
    return null;
  }


  logResult() {
    let newLog = this.state.logs;
    const now = this.getTime()
    newLog['results'].push({
      'submitTime': now,
      'timeSinceLastAnswer': now - this.state.timeLastAnswer,
      'questionId': this.state.currentQuestion.id
    });
    this.setState({
      logs: newLog
    });
  }

  logFinal() {
    let newLog = this.state.logs;
    const now = this.getTime()
    newLog['totalDurationQuestionSequence'] = now - newLog['timeMounted'];
    newLog['timeQuestionSequenceEnd'] = now;
    this.setState({
      logs: newLog
    });
  }

  onSubmitAnswer(answerId) {
    // logging
    this.logResult();
    
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
    let status;
    if (!this.props.userSignedIn && !this.props.captchaVerified) {
      // add to waiting queue to be verified by captcha
      this.state.unverifiedAnswers.push(resultData);

      // trigger captcha verification
      grecaptcha.execute();
      
      // proceed to next question
      status = true;
    } else {
      // Make POST request to submit result
      status = this.props.submitResult(resultData);
    }

    if (status) {
      // store internally
      this.setState({
        results: this.state.results.concat([resultData])
      }, () => {
        // find next question
        var nextQuestion = this.nextQuestion(this.state.currentQuestion.id, answerId);
        var newNumQuestionAnswered = this.state.numQuestionsAnswered + 1;
        if (nextQuestion === null) {
          // End of question sequence
          this.logFinal()
          this.setState({
            'tweetHasLoaded': false,
            'numQuestionsAnswered': newNumQuestionAnswered
          }, () => {
            this.props.onQuestionSequenceEnd(this.state.results, this.state.logs);
          });
        } else {
          // Go to next question
          this.setState({
            'currentQuestion': this.props.questions[nextQuestion],
            'numQuestionsAnswered': newNumQuestionAnswered
          });
        }
      })
    }
  }
  
  // executed once the captcha has been verified
  verifyCallback(response) {
    var resultData;
    // Post any unverified data to server
    while (this.state.unverifiedAnswers.length > 0) {
      resultData = this.state.unverifiedAnswers.pop()
      resultData['recaptcha_response'] = response;
      this.props.submitResult(resultData);
    }
  };

  enableAnswerButtons() {
    this.setState({answersDisabled: false});
  }

  delayEnableAnswers() {
    // Make answer buttons clickable after delay
    setTimeout(() => this.enableAnswerButtons(), this.props.enableAnswersDelay);
  }

  onTweetLoad() {
    var style = document.createElement('style')
    style.innerHTML = '.EmbeddedTweet { border-color: #ced7de; max-width: 100%; }'
    try {
      var shadowRoot = this.tweet.querySelector('.twitter-tweet').shadowRoot
      if (shadowRoot != null) {
        shadowRoot.appendChild(style)
        if (shadowRoot.children[1].innerHTML == "") {
          // This can occur when a tweet was set to private, thus is not accessible anymore. Handle this case separately
          console.log("Tweet with id", this.props.tweetId, "could not be loaded.")
          this.props.onTweetLoadError();
        }
      }
    } catch(err) {
      console.log('An error occured while trying to access shadow DOM.')
      console.log(err)
    }
    this.setState({
      'tweetIsLoading': false
    });
    this.delayEnableAnswers();
  }

  toggleQuestionInstructions() {
    this.setState({showQuestionInstruction: !this.state.showQuestionInstruction})
  }

  render() {
    let parentThis = this;
    let progressDots = [];
    let Q = "Q" + (this.state.numQuestionsAnswered+1).toString();
    let tweetEmbedding;
    for (let i = 0; i < this.props.numTransitions; ++i) {
      let liClassName = "";
      if (i < this.state.numQuestionsAnswered) {
        liClassName = "complete"
      } else if (i == this.state.numQuestionsAnswered) {
        liClassName = "current"
      }
      progressDots.push(
        <li className={liClassName} key={i}><span>{i}</span></li>
      )
    }
    if (this.state.showTweetText) {
      tweetEmbedding = <TweetTextEmbedding tweetText={this.props.tweetText} />
    } else {
      tweetEmbedding = <TweetEmbedding tweetId={this.props.tweetId} onTweetLoad={() => this.onTweetLoad()} />
    }
    let questionSequenceBody = <div ref={(tweet) => this.tweet = tweet}>
      {/* Title and tweet */}
      <div className='row justify-content-center'> 
        <div className="col-12">
          {this.props.projectTitle && <h4 className="mb-5">{this.props.projectTitle}</h4>} 
          {tweetEmbedding}
        </div>
      </div>
      {/* Loading clip */}
      { this.state.tweetIsLoading &&
          <div className="row">
            <div className="col-12">
              <div className="clip-loader">
                <ClipLoader
                  color={'#444'} 
                />
              </div>
            </div>
          </div>
      } 
      {/* Circle question number */}
      { !this.state.tweetIsLoading && 
          <div className="row justify-content-center">
            <div className="col-xs-12 col-lg-8 text-center">
              <div className="v-line"></div>
              <h4 className="circle-text mb-4">{Q}</h4>
              {/* Question */}
              <Question 
                question={this.state.currentQuestion.question}
                hasInstructions={this.props.displayQuestionInstructions && this.state.currentQuestion.instructions != ""}
                toggleQuestionInstructions={() => this.toggleQuestionInstructions()}
              />
              {/* Answers */}
              <div className="buttons mb-4">
                {this.state.currentQuestion.answers.map(function(answer) {
                  return <Answer 
                    key={answer.id} 
                    answer={answer.answer} 
                    disabled={parentThis.state.answersDisabled}
                    submit={() => parentThis.onSubmitAnswer(answer.id)}
                    color={answer.color}
                  />
                })}
              </div>
              {/* Progress dots */}
              <ul className="progress-dots">
                { progressDots }
              </ul>
            </div> 
          </div> 
      }
      {/* Invisible recaptcha */}
      {!this.props.userSignedIn && !this.props.captchaVerified &&
          <div className="g-recaptcha"
            data-sitekey={this.props.captchaSiteKey}
            data-callback="onCaptchaVerify"
            data-size="invisible">
          </div>
      }
    </div>
      let questionInstructions = this.state.showQuestionInstruction && <QuestionInstructions 
        instructions={this.state.currentQuestion.instructions} 
        toggleQuestionInstructions={() => this.toggleQuestionInstructions()}
      /> 
    return (
      <div>
        {questionInstructions}
        {questionSequenceBody}
      </div>
    );
  }
}
