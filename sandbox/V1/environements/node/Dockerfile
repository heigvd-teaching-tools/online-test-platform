FROM node

ARG mode
ENV CODE="code.js"
ENV SOLUTION="solution.js"
ENV MODE=$mode
ENV NODE_NO_WARNINGS=1
COPY ./ ./ 
RUN chmod 755 /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD [${FILE_TO_RUN}]
# --build-arg "file_name=..."