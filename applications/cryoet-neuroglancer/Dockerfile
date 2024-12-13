ARG CLOUDHARNESS_FRONTEND_BUILD

FROM $CLOUDHARNESS_FRONTEND_BUILD as frontend

ENV APP_DIR=/app

WORKDIR ${APP_DIR}
COPY frontend/package.json ${APP_DIR}
COPY frontend/yarn.lock ${APP_DIR}
RUN yarn install --frozen-lockfile --timeout 60000

COPY frontend ${APP_DIR}
RUN yarn build

#####
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=frontend /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]