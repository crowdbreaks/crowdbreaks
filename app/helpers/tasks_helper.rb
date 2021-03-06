module TasksHelper
  def results_exist_for_task?(task)
    task.results.count > 0
  end

  def mturk_cached_hit_exists?(task)
    hit = MturkCachedHit.find_by(hit_id: task.hit_id)
    hit.present?
  end

  def get_mturk_cached_hit_id(task)
    MturkCachedHit.find_by(hit_id: task.hit_id).id
  end
end
