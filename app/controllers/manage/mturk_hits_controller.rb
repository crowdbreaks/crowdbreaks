module Manage
  class MturkHitsController < BaseController
    # protect_from_forgery except: :update_cached_hits
    authorize_resource class: false
    before_action :mturk_init

    def index
      @page = params[:page].present? ? params[:page].to_i : 1
      @sandbox = in_sandbox?
      @filtered = filtered?
      # hits_list = @mturk.list_hits
      @hits = []
      @next_token = nil
      @num_hits = 0
      @balance = 0

      # hits_list = @mturk.list_hits
      # @hits = hits_list[:hits]
      # @next_token = hits_list[:next_token]
      # @num_hits = hits_list[:num_results]
      # @balance = @mturk.check_balance.available_balance
    end

    def show
      @hit = @mturk.get_hit(mturk_hit_params[:id])
    end

    def destroy
      return_val = @mturk.delete_hit(mturk_hit_params[:id])
      if return_val.nil?
        redirect_to(mturk_hits_path, alert: 'Could not delte HIT. HITs can only be deleted in states of "Assignable", "Reviewing" or "Reviewable".')
      else
        redirect_to(mturk_hits_path, notice: 'Successfully deleted HIT.')
      end
    end

    def update_cached_hits
      if current_user
        # Make sure job is only run once every 20sec
        if not Rails.cache.exist?('mturk_hits_recently_updated')
          Rails.cache.write('mturk_hits_recently_updated', 1, expires_in: 20.seconds)
          UpdateMturkChachedHitsJob.perform_later(current_user.id)
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

    private

    def mturk_hit_params
      params.permit(:id, :sandbox, :filtered)
    end

    def mturk_init
      @mturk = Mturk.new(sandbox: in_sandbox?)
    end

    def in_sandbox?
      if params[:sandbox].present?
        params[:sandbox] == 'true' ? true : false
      else
        true
      end
    end

    def filtered?
      if params[:filtered].present?
        params[:filtered] == 'true' ? true : false
      else
        false
      end
    end
  end
end
