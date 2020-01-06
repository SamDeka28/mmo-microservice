FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf

# COPY localhost.crt /etc/nginx/localhost.crt
# COPY localhost.key /etc/nginx/localhost.key

COPY nginx.conf /etc/nginx/conf.d/default.conf