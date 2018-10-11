class LocalBatchJobsController < ApplicationController
  load_and_authorize_resource :find_by => :slug

  def show
    @user_id = current_user&.id
    # only allow certain users to do task
    if not user_signed_in? or not @local_batch_job.allows_user?(@user_id)
      raise CanCan::AccessDenied
    end
    # calculate counts
    @user_count = @local_batch_job.results.counts_by_user(@user_id)
    @total_count = @local_batch_job.local_tweets.is_available.count
    @total_count_unavailable = @local_batch_job.local_tweets.is_unavailable.count
    # Get inital tweet
    local_tweet = @local_batch_job.local_tweets.not_assigned_to_user(@user_id, @local_batch_job.id).is_available.first 
    @tweet_id = local_tweet&.tweet_id
    @tweet_text = local_tweet&.tweet_text
    @no_work_available = @tweet_id.nil?
    if @tweet_text == ""
      @tweet_is_available = TweetValidation.new.tweet_is_valid?(@tweet_id)
      if not @tweet_is_available
        LocalTweet.set_to_unavailable(@tweet_id, @local_batch_job.id)
      end
    else
      # If in text mode, tweet is always available
      @tweet_is_available = true
    end
    @project = @local_batch_job.project
    @instructions = @local_batch_job.instructions
    @question_sequence = QuestionSequence.new(@project).load
  end

  def final
    user_id = final_params[:user_id]
    if user_id.nil? or final_params[:tweet_id].nil?
      head :bad_request and return 
    end
    local_batch_job = LocalBatchJob.friendly.find(params[:local_batch_job_id])

    # store results
    results = final_params.fetch(:results, []) 
    logs = final_params.fetch(:logs, {}) 
    if not results.empty? and not local_batch_job.test_processing_mode?
      if not create_results(results, local_batch_job.id, logs)
        head :bad_request
      end
    end

    # fetch next tweet
    if local_batch_job.test_processing_mode?
      local_tweet = local_batch_job.local_tweets.is_available.order("RANDOM()").first
    else
      local_tweet = local_batch_job.
        local_tweets.
        not_assigned_to_user(user_id, local_batch_job.id).
        is_available&.
        first
    end
    tweet_id = local_tweet&.tweet_id&.to_s
    tweet_text = local_tweet&.tweet_text

    # validate tweet
    no_work_available = tweet_id.nil?
    if tweet_text == ""
      tweet_is_available = TweetValidation.new.tweet_is_valid?(tweet_id)
      if not tweet_is_available
        LocalTweet.set_to_unavailable(tweet_id.to_i, local_batch_job.id)
      end
    else
      tweet_is_available = true
    end

    # calculate counts
    total_count = local_batch_job.local_tweets.is_available.count
    user_count = local_batch_job.results.counts_by_user(user_id)
    total_count_unavailable = local_batch_job.local_tweets.is_unavailable.count

    # send info back
    render json: {
      tweet_id: tweet_id,
      tweet_text: tweet_text,
      tweet_is_available: tweet_is_available,
      user_count: user_count,
      total_count: total_count,
      total_count_unavailable: total_count_unavailable,
      no_work_available: no_work_available
    }, status: 200
  end

  private

  def create_results(results, local_batch_job_id, logs)
    qs_log = QuestionSequenceLog.create(log: logs)
    results.each do |r|
      result_params = r[:result].merge({local_batch_job_id: local_batch_job_id, res_type: :local, question_sequence_log_id: qs_log.id})
      result = Result.new(result_params)
      return false if not result.save
    end
    true
  end

  def final_params   
      params.require(:qs).permit(:tweet_id, :user_id, :project_id, results: [result: [:answer_id, :question_id, :tweet_id, :user_id, :project_id]],
                                 logs: [:timeInitialized, :answerDelay, :timeMounted, :userTimeInitialized, :totalDurationQuestionSequence, :timeQuestionSequenceEnd,
                                        results: [:submitTime, :timeSinceLastAnswer, :questionId],
                                        resets: [:resetTime, :resetAtQuestionId, previousResultLog: [:submitTime, :timeSinceLastAnswer, :questionId]]])
  end
end
