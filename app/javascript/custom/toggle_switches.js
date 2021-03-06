// Toggle switches (auto reload on toggle)
// ---------------------
// Manage/MturkWorker/index
function toggleBlacklisted() {
  $('#mturk-worker-blacklisted-checkbox').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_blacklisted', toBeChecked);
  });
}
function toggleReviewed() {
  $('#mturk-worker-reviewed-checkbox').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_reviewed', toBeChecked);
  });
}
function toggleBlocked() {
  $('#mturk-worker-blocked-checkbox').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_blocked', toBeChecked);
  });
}
// Manage/MturkWorker/review
function selectWorkerReviewBatchJob() {
  $('#worker-review-mturk_batch_job-filter').change(function() {
    let batch_name = $(this).find(":selected").val()
    changeSelectParam('batch_name_filter', batch_name)
  })
}

// Manage/MturkCachedHit/index
function toggleSandbox() {
  $('.production-checkbox').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('sandbox', !toBeChecked);
  });
}
function togglePlatformOnly() {
  $('.platform_only-hits-checkbox').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('platform_only', toBeChecked);
  });
}
function toggleShowAssignable() {
  $('.assignable-hits-checkbox').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_assignable', toBeChecked);
  });
}
function toggleShowUnassignable() {
  $('.unassignable-hits-checkbox').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_unassignable', toBeChecked);
  });
}
function toggleShowReviewable() {
  $('.reviewable-hits-checkbox').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_reviewable', toBeChecked);
  });
}
function toggleShowReviewing() {
  $('.reviewing-hits-checkbox').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_reviewing', toBeChecked);
  });
}
// Admin/Result/index
function toggleGroupByQs() {
  $('.groupby-qs').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('group_by_qs', toBeChecked);
  });
}
function selectProjectResults() {
  $('#results-select-project-filter').change(function() {
    let project_id = $(this).find(":selected").val()
    changeSelectParam('project_id_filter', project_id)
  })
}
function selectResTypeResults() {
  $('#results-res-type-filterfilter').change(function() {
    let res_type = $(this).find(":selected").val()
    changeSelectParam('res_type_filter', res_type)
  })
}
// Manage/MturkBatchJob/Task/index
function toggleTaskUnsubmited() {
  $('.tasks-unsubmitted').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_unsubmitted', toBeChecked);
  });
}
function toggleTaskSubmited() {
  $('.tasks-submitted').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_submitted', toBeChecked);
  });
}
function toggleTaskAssigned() {
  $('.tasks-assigned').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_assigned', toBeChecked);
  });
}
function toggleTaskCompleted() {
  $('.tasks-completed').change(function() {
    let toBeChecked = $(this).is(':checked');
    toggleParam('show_completed', toBeChecked);
  });
}


// Select all checkbox (looks for checkboxes with class multi-checkable)
function toggleCheckAll() {
  $('#check-all').change(function() {
    let checkboxes = $('.multi-checkable')
    checkboxes.prop('checked', $(this).is(':checked'));
  });
}

// helpers
function toggleParam(param, toBeChecked) {
  let url = new URL(window.location.href);
  url.searchParams.delete(param)
  if (toBeChecked) {
    url.searchParams.append(param, true)
  } else {
    url.searchParams.append(param, false)
  }
  window.location.href = url.href
}

function changeSelectParam(param, value) {
  let url = new URL(window.location.href);
  url.searchParams.delete(param)
  url.searchParams.append(param, value)
  window.location.href = url.href
}

$(document).on('turbolinks:load', function() {
  toggleBlacklisted();
  toggleReviewed();
  toggleBlocked();

  toggleGroupByQs();

  toggleSandbox();
  togglePlatformOnly();
  toggleShowAssignable();
  toggleShowUnassignable();
  toggleShowReviewable();
  toggleShowReviewing();

  toggleTaskUnsubmited();
  toggleTaskSubmited();
  toggleTaskAssigned();
  toggleTaskCompleted();

  selectProjectResults();
  selectResTypeResults();
  selectWorkerReviewBatchJob();

  toggleCheckAll();
})
