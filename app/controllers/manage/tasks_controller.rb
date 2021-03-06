module Manage
  class TasksController < BaseController
    load_and_authorize_resource :mturk_batch_job
    load_and_authorize_resource :task, through: :mturk_batch_job

    def new
    end

    def index
      @show_unsubmitted = param_is_truthy?(:show_unsubmitted, default: true)
      @show_submitted = param_is_truthy?(:show_submitted, default: true)
      @show_assigned = param_is_truthy?(:show_assigned, default: true)
      @show_completed = param_is_truthy?(:show_completed, default: true)
      if params[:search_task].present?
        @tasks = @tasks.where(id: params[:search_task]).page params[:page]
      else
        statuses = []
        statuses.push(:unsubmitted) if @show_unsubmitted
        statuses.push(:submitted) if @show_submitted
        statuses.push(:assigned) if @show_assigned
        statuses.push(:completed) if @show_completed
        @tasks = @tasks.where(lifecycle_status: statuses).order({lifecycle_status: :asc, updated_at: :desc}).page params[:page]
      end
    end

    def show
    end

    def create
    end

    def edit
    end

    def update
      if @task.update_attributes(task_params)
        redirect_to mturk_batch_job_tasks_path, notice: 'Task successfully updated!'
      else
        redirect_to mturk_batch_job_tasks_path, alert: 'Editing task was unsuccessful'
      end
    end

    def destroy
      if @task.hit_id.present?
        resp = @task.delete_hit
        if resp.nil?
          redirect_to(mturk_batch_job_tasks_path, alert: 'Could not delete Task because corresponding HIT is in a state in which it cannot be deleted/disposed.') and return
        end
      end
      if @task.destroy
        redirect_to mturk_batch_job_tasks_path, notice: 'Task successfully destroyed.'
      else
        redirect_to mturk_batch_job_tasks_path, alert: 'Task could not be destroyed.'
      end
    end

    private

    def task_params
      params.require(:task).permit(:tweet_id, :hit_id)
    end
  end
end
