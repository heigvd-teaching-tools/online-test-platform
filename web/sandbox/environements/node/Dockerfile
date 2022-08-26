FROM node

ARG file_name
ENV FILE_TO_RUN=$file_name

COPY ./$file ./ 
COPY entrypoint.sh /
RUN chmod 755 /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD [${FILE_TO_RUN}]
# --build-arg "file_name=..."