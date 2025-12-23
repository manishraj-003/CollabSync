FROM node:18-alpine

WORKDIR /app

# Copy ONLY gateway package files
COPY package.json package-lock.json ./

# Force install dependencies
RUN npm install

# Copy rest of gateway source
COPY . .

EXPOSE 8000

CMD ["node", "src/index.js"]
