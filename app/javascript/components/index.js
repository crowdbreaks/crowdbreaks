import WebpackerReact from 'webpacker-react'
import TweetEmbed from 'react-tweet-embed'

// React components
import { QSContainer } from './qs/QSContainer';
import { MturkQSContainer } from './qs/MturkQSContainer';
import { LocalBatchQSContainer } from './qs/LocalBatchQSContainer';
import { SentimentTextBox } from './sent_textbox/SentimentTextBox';
import { MonitorStream } from './monitor_stream/MonitorStream';
import { Leadline } from './frontpage/Leadline';
import { UserActivity } from './user_activity/UserActivity';
import { EditQuestionSequence } from './edit_question_sequence/EditQuestionSequence';
import { Assignment } from './mturk_worker/Assignment';
import { StreamGraph } from './stream_graph/StreamGraph';
import { StreamGraphKeywords } from './stream_graph_keywords/StreamGraphKeywords';
import { MlModels } from './ml_models/MlModels';
import { MlPlayground } from './ml_playground/MlPlayground';
import { PredictViz } from './predict_viz/PredictViz';
import { DownloadResource } from './helpers/DownloadResource';

// Register components using Webpacker-react
WebpackerReact.setup({
  QSContainer,
  MturkQSContainer,
  SentimentTextBox,
  MonitorStream,
  Leadline,
  UserActivity,
  EditQuestionSequence,
  LocalBatchQSContainer,
  TweetEmbed,
  Assignment,
  StreamGraph,
  StreamGraphKeywords,
  MlModels,
  MlPlayground,
  PredictViz,
  DownloadResource
})

// This is needed for components to properly unmount and not being cached
$(document).on('turbolinks:before-cache', () => WebpackerReact.unmountComponents())
