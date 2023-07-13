echo "[default]" > /root/.aws/config
echo "aws_access_key_id = ${AWS_ACCESS_KEY_ID}" >> /root/.aws/config
echo "aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}" >> /root/.aws/config
echo "region = ${AWS_REGION}" >> /root/.aws/config