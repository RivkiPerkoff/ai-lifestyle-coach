# שימוש בגרסת Node עדכנית וקלה
FROM node:20-alpine

WORKDIR /app

# העתקת קבצי התלות והתקנתם
COPY package*.json ./
RUN npm install

# העתקת שאר הקוד
COPY . .

EXPOSE 3000

# הרצת השרת (React Scripts)
CMD ["npm", "start"]