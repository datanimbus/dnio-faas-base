
    FROM data.stack:b2b.base.undefined

    WORKDIR /app

    COPY . .

    ENV NODE_ENV="production"
    ENV DATA_STACK_NAMESPACE="undefined"
    ENV DATA_STACK_APP="UX-Training"
    ENV DATA_STACK_PARTNER_ID="undefined"
    ENV DATA_STACK_PARTNER_NAME="undefined"
    ENV DATA_STACK_FUNCTION_NAMESPACE="undefined"
    ENV DATA_STACK_FUNCTION_ID="NS2044"
    ENV DATA_STACK_FUNCTION_NAME="abc"
    ENV DATA_STACK_FUNCTION_VERSION="0"
    ENV DATA_STACK_DEPLOYMENT_NAME="undefined"
    ENV RELEASE="dev"
    ENV PORT="31000"
    ENV DATA_DB="undefined-UX-Training"

    EXPOSE 31000

    CMD [ "node", "app.js" ]
  