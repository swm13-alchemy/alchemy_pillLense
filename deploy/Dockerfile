FROM public.ecr.aws/lambda/nodejs:14

# Copy mobilenet model files
RUN mkdir -p /usr/models
COPY models  /usr/models
RUN chmod -R 777 /usr/models

# Copy package.json + package-lock.json and cache npm dependences
COPY package.json ${LAMBDA_TASK_ROOT}
COPY package-lock.json ${LAMBDA_TASK_ROOT}
RUN npm ci --only=prod

# Copy handler function
COPY .webpack/classify/src/functions/classify/handler.js ${LAMBDA_TASK_ROOT}

# Set the CMD to the handler
CMD [ "handler.main" ]
