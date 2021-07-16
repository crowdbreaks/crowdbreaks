source 'https://rubygems.org'
ruby '2.5.8'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

gem 'rails', '~> 5.2.2'

# Postgresql db
gem 'pg', '~> 0.18'
# Ruby server
gem 'puma', '~> 4.3'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0', '>= 5.0.4'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.5'
# ENV vars management
gem 'figaro', '~> 1.1.1'
# authentication
gem 'devise', '>= 4.7.0'
gem 'devise-i18n'
# authorization
gem 'cancancan', '~> 2.0'
# font icons
gem 'font-awesome-rails', '~> 4.7.0.1'
# Pagination
gem 'kaminari', '~> 1.2.0'
# Forms
gem 'simple_form'
# Bootstrap
gem 'bootstrap', '>= 4.3.1'
# Use autoprefixes for CSS
gem 'autoprefixer-rails', '>= 9.1.0'
# HTTP requests
gem 'httparty', '~> 0.13.7'
# I18n for model columns using JSONB
gem 'json_translate'
# slug creation
gem 'friendly_id', '~> 5.1'
# AWS
gem 'aws-sdk-ecs'
gem 'aws-sdk-elasticsearchservice'
gem 'aws-sdk-firehose'
gem 'aws-sdk-mturk'
gem 'aws-sdk-s3'
gem 'aws-sdk-sagemaker'
gem 'aws-sdk-sagemakerruntime'
# email
gem 'mandrill-api'
# JS build
gem 'webpacker', '~> 4.0'
gem 'webpacker-react', '~> 0.3.2'
# JSON serializer
gem 'active_model_serializers', '~> 0.10.0'
# Twitter API
gem 'twitter'
# Job scheduling
# gem 'redis'
gem 'sidekiq', '~> 5.2.7'
# Monitoring
gem 'rollbar'
# Advisory lock
gem 'with_advisory_lock'
# Elasticsearch
gem 'elasticsearch'
# Elasticsearch queries helper
gem 'stretchy'
# AWS Authentication
gem 'faraday', '~> 0.15'
gem 'faraday_middleware-aws-sigv4'
# Turbolinks
gem 'turbolinks', '~> 5.2.0'

group :development, :test do
  gem 'rspec-rails'
  gem 'rspec-its'
  gem 'rspec-activemodel-mocks'
  # gem 'quiet_assets' # don't show asset pipeline log
  gem 'guard'
  gem 'guard-rspec'
  gem 'guard-bundler'
  gem 'guard-sidekiq'
  gem 'guard-livereload'
  gem 'rb-fsevent'
  gem 'byebug', platform: :mri
  gem 'ffaker'
  gem 'foreman'
  # allows failing tests if translations are missing
  gem 'i18n-tasks'
  # recording the requests Response for replay
  gem 'vcr'
  # load variables from .env files to ENV
  gem 'dotenv-rails'
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console', '>= 3.3.0'
  gem 'listen', '~> 3.0.5'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
  gem 'rubocop', require: false
  # gem 'rails_real_favicon'
  gem 'letter_opener'
end

group :test do
  # feature tests for testing react code
  gem 'capybara'
  gem 'capybara-selenium'
  gem 'webdrivers'
  # nice rspec factories
  gem 'factory_bot_rails'
  # leave your test db clean after you
  gem 'database_cleaner'
  # freeze/manage time in tests
  gem 'timecop'
  # extra RSpec matchers
  gem 'shoulda-matchers'
  # check test coverage
  gem 'simplecov', require: false
  # additional controller testing functionality
  gem 'rails-controller-testing'
  # stubbing of requests
  gem 'webmock'
end

group :production do
  gem 'rails_12factor'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
# gem 'tzinfo-data', platforms: %i[mingw mswin x64_mingw jruby]
