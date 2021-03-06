desc 'Send status email update'
namespace :status_mailer do
  task weekly: :environment do
    # This is needed because the Heroku scheduler does not support weekly executions
    StatusMailerJob.perform_later(type: 'weekly') if Date.today.wday == 1 # Check if today is Monday
  end

  task daily: :environment do
    StatusMailerJob.perform_later(type: 'daily')
  end
end
