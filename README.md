````markdown
# 🐾 Beast Mode Tracker 💪

An all-in-one productivity and mental growth companion. Track your tasks, journal your day, reflect with AI, and build discipline with nofap tracking.

## 🌟 Features
- ✅ Manual task tracker with completion and history
- 📓 Daily journal with PDF export
- 🤖 Reflection AI chatbot for self-improvement
- 🔐 User authentication with sessions
- 📈 Nofap history tracker
- 🧠 Quote slider for daily motivation

## 🛠️ Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **Authentication:** JWT & Sessions
- **AI Chatbot:** ChatGPT Integration (Planned)

## 🚀 Getting Started Locally

1. Clone the repo
```bash
git clone https://github.com/mohitarora1712/beastmodetracker.git
cd beastmodetracker
````

2. Install dependencies

```bash
cd client
npm install

cd ../server
npm install
```

3. Create `.env` files in both `client/` and `server/` with necessary credentials:

* **Server .env**

  ```
  PORT=5000
  MONGO_URI=your_mongodb_uri
  JWT_SECRET=your_jwt_secret
  SESSION_SECRET=your_session_secret
  ```

* **Client .env**

  ```
  REACT_APP_API_URL=http://localhost:5000
  ```

4. Run the project

```bash
# Start frontend
cd client
npm start

# In another terminal, start backend
cd server
node index.js
```

## 🌐 Deployment

Frontend: Vercel / Netlify
Backend: Render / Railway

(Detailed deployment steps coming soon)

## 🤝 Contributing

Pull requests are welcome. Let's build the ultimate self-improvement companion together.

## 📄 License

MIT

```
```
