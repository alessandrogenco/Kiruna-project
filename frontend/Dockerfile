FROM node:20

WORKDIR /app

COPY . .
RUN npm install

# Expose port 5173
EXPOSE 5173

# Command to run the frontend
CMD ["npm", "run", "start", "--", "--host"]