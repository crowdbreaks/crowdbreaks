/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

import React from 'react';
import { render } from 'react-dom';
import { QSContainer } from './../components/QSContainer';

document.addEventListener('turbolinks:load', () => {
  var div_to_render_in = document.getElementById('question-sequence-component');
  if (div_to_render_in) {
    var questions = JSON.parse(div_to_render_in.dataset.questions);
    var initialQuestionId = div_to_render_in.dataset.initialQuestionId;
    var transitions = JSON.parse(div_to_render_in.dataset.transitions);
    var tweetId = div_to_render_in.dataset.tweetId;
    render(
      <QSContainer 
        initialQuestionId={initialQuestionId}
        questions={questions}
        transitions={transitions}
        tweetId={tweetId}
      />, div_to_render_in);
  }
});
