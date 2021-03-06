module Manage
  class MturkTweetsController < BaseController
    load_and_authorize_resource :mturk_batch_job
    load_and_authorize_resource :mturk_tweet, through: :mturk_batch_job

    def index
      type = 'mturk-batch-job-tweets'
      respond_to do |format|
        format.html {
          @download_link_args = [mturk_batch_job_mturk_tweets_path(@mturk_batch_job)]
          @download_link_keywordargs = {remote: true}
          if @mturk_batch_job.assoc_s3_key_exists?(type, @mturk_batch_job.mturk_tweets)
            @download_link_args = [mturk_batch_job_mturk_tweets_path(@mturk_batch_job, format: :csv)]
            @download_link_keywordargs = {}
          end
          @mturk_tweets = @mturk_batch_job.mturk_tweets.page params[:page]
        }
        format.csv { 
          redirect_to @mturk_batch_job.assoc_signed_file_path(type, @mturk_batch_job.mturk_tweets)
        }
        format.js {
          ActionCable.server.broadcast("job_notification:#{current_user.id}", job_status: 'running', record_id: @mturk_batch_job.id, job_type: "#{type}_s3_upload", message: 'Upload started.')
          S3UploadJob.perform_later(type, @mturk_batch_job.id, current_user.id)
          head :ok
        }
      end
    end

    def update_availability
      if current_user
        RefreshMturkTweetsAvailabilityJob.perform_later(params[:mturk_batch_job_id], current_user.id)
        respond_to do |format|
          format.js { head :ok }
        end
      else
        respond_to do |format|
          format.js { head :bad_request }
        end
      end
    end
  end
end
