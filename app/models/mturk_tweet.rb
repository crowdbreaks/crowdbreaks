class MturkTweet < ApplicationRecord
  belongs_to :mturk_batch_job
  has_many :tasks
  has_many :mturk_workers, through: :tasks

  # Availibilty of tweet (if not_available tweet may be either protected or deleted)
  enum availability: [:unknown, :available, :unavailable]

  scope :unassigned, -> { includes(:tasks).where(tasks: {id: nil}) }
  scope :assigned, -> { includes(:tasks).where.not(tasks: {id: nil}) }
  scope :num_assignments_below, -> (threshold) { where(id: MturkTweet.select(:id).joins(:tasks).group('mturk_tweets.id').having('count(tasks.id) < ?', threshold)) }
  scope :not_assigned_to_worker, -> (worker_id) { where.not(id: MturkWorker.find_by(worker_id: worker_id)&.mturk_tweets&.select(:id)) }
  scope :assigned_to_worker, -> (worker_id) { includes(:mturk_workers).where(mturk_workers: {worker_id: worker_id}) }
  scope :may_be_available, -> { where(availability: [:available, :unknown]) }
  scope :order_by_num_assignments, -> { left_joins(:tasks).group('mturk_tweets.id').order(Arel.sql('count(tasks.id) ASC')) }
end
