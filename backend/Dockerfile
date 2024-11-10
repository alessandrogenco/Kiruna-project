FROM node:20

WORKDIR /app

COPY . .
RUN npm install

# Expose port 3001
EXPOSE 3001

# Command to run the backend
CMD ["node", "index.mjs"]