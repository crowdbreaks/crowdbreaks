class AwsS3
  attr_reader :client, :bucket

  def initialize(bucket: nil)
    @client = Aws::S3::Client.new
    if bucket.nil?
      @bucket_name = ENV['S3_BUCKET_NAME'] || 'crowdbreaks-dev'
    else
      @bucket_name = bucket
    end
    @signer = Aws::S3::Presigner.new
    if @bucket_name.present?
      s3 = Aws::S3::Resource.new
      @bucket = s3.bucket(@bucket_name)
    else
      raise "Environment variable S3_BUCKET_NAME has to be set in order to use S3 buckets!"
    end
  end

  def put(data, filepath, overwrite=false)
    if exists?(filepath) and not overwrite
      Rails.logger.info("File #{filepath} exists already on S3.")
      return
    end
    obj = @bucket.object(filepath)
    obj.put(body: data)
  end

  def upload_file(source_path, target_key, overwrite=false)
    if exists?(target_key) and not overwrite
      Rails.logger.info("File #{target_key} exists already on S3.")
      return
    end
    obj = @bucket.object(target_key)
    obj.upload_file(source_path)
  end

  def get_signed_url(filepath, filename: 'data.csv', expires_in: 600)
    # expiry after 10min by default
    @signer.presigned_url(:get_object, bucket: @bucket_name, key: filepath, expires_in: expires_in, response_content_disposition: "attachment; filename=#{filename}")
  end

  def get_public_url(filepath)
    @bucket.object(filepath).public_url
  end

  def get(filepath)
    @client.get_object(bucket: @bucket_name, key: filepath)
  end

  def exists?(filepath)
    begin
      head(filepath)
    rescue Aws::S3::Errors::NotFound
      return false
    else
      return true
    end
  end

  def list_dir(prefix)
    @bucket.objects(prefix: prefix).collect(&:key)
  end

  def remove(target_key)
    obj = @bucket.object(target_key)
    obj.delete
  end

  def head(filepath)
    @client.head_object(bucket: @bucket_name, key: filepath)
  end
end
