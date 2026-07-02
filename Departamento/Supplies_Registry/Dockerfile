FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_DEPARTMENT_ID
ENV NEXT_PUBLIC_DEPARTMENT_ID=$NEXT_PUBLIC_DEPARTMENT_ID
RUN npm run build

EXPOSE 8010

ENV NODE_ENV=production
CMD ["npm", "run", "start"]