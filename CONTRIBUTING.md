# Contributing to Know India

First off, **thank you** for considering contributing to Know India! 🙏

Whether you're fixing a typo, adding a feature, improving docs, or just opening an issue — every contribution matters and is deeply appreciated.

This guide will help you get started. Don't worry if it's your first time contributing to open source — we've all been there, and we're here to help!

---

## 🌟 Ways to Contribute

There are many ways to contribute, and not all of them require writing code:

| Type | Examples |
|------|----------|
| 🐛 **Bug Reports** | Found something broken? Let us know! |
| 💡 **Feature Ideas** | Have an idea to make Know India better? |
| 📝 **Documentation** | Fix typos, improve explanations, add examples |
| 🎨 **UI/UX** | Design improvements, accessibility fixes |
| 🌐 **Translations** | Help make Know India available in more languages |
| 🧪 **Testing** | Write tests, find edge cases |
| 💬 **Community** | Answer questions, help other contributors |

**No contribution is too small.** Even fixing a single typo helps!

---

## 🚀 Getting Started

### 1. Fork the Repository

Click the **Fork** button at the top right of the [repository page](https://github.com/aryanjsx/know-India).

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/know-India.git
cd know-India
```

### 3. Create a Branch

Always create a new branch for your changes:

```bash
git checkout -b your-branch-name
```

**Branch naming tips:**
- `fix/login-button-bug`
- `feature/dark-mode-toggle`
- `docs/update-readme`
- `ui/improve-mobile-nav`

---

## 💻 Local Development

### Quick Overview

The project has two main parts:

```
know-India/
├── frontend/    # React app (port 3000)
└── backend/     # Express API (port 5000)
```

### Setup Steps

1. Install dependencies in both folders:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Set up your `.env` file in the backend folder (see README for details)

3. Start the development servers:
   ```bash
   # Terminal 1
   cd backend && npm start
   
   # Terminal 2
   cd frontend && npm start
   ```

> **Note:** You'll need Node.js 18+, MySQL, and API keys for full functionality. Check the [README](README.md) for complete setup instructions.

---

## ✍️ Commit Messages

We follow a simple commit message format. No need to stress about it — just try to be clear:

```
type: short description
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Formatting, no code change
- `refactor:` — Code restructuring
- `test:` — Adding tests
- `chore:` — Maintenance tasks

**Examples:**
```
feat: add share button to place page
fix: resolve login redirect loop
docs: update contributing guidelines
style: format navbar component
```

Don't overthink it. A clear message is better than a perfect format.

---

## 🔀 Pull Request Guidelines

### Before Submitting

- [ ] Your code works locally
- [ ] You've tested the changes
- [ ] Your branch is up to date with `main`

### Submitting a PR

1. Push your branch:
   ```bash
   git push origin your-branch-name
   ```

2. Go to the repository and click **"Compare & pull request"**

3. Fill out the PR template:
   - **What** does this PR do?
   - **Why** is this change needed?
   - **How** can it be tested?

4. Link any related issues (e.g., "Closes #42")

### What Happens Next

- A maintainer will review your PR
- They might request changes — this is normal and not a rejection!
- Once approved, your PR will be merged 🎉

> **Tip:** Smaller PRs are easier to review and merge faster.

---

## 🎨 Code Style

We don't enforce strict rules, but please try to:

- **Follow existing patterns** — Look at how similar code is written in the project
- **Use meaningful names** — `userProfile` is better than `up`
- **Keep it readable** — Add comments for complex logic
- **Format your code** — Use Prettier or your editor's formatter

### Frontend (React)
- Functional components with hooks
- Tailwind CSS for styling
- Framer Motion for animations

### Backend (Node.js)
- Express route handlers
- Async/await for asynchronous code
- Environment variables for secrets

---

## 🐛 Reporting Issues

Found a bug? Have a suggestion? [Open an issue](https://github.com/aryanjsx/know-India/issues/new)!

### Bug Reports

Please include:
- **What happened** — Describe the bug
- **What you expected** — What should have happened?
- **Steps to reproduce** — How can we see this bug?
- **Screenshots** — If applicable
- **Environment** — Browser, OS, device

### Feature Requests

Please include:
- **The problem** — What are you trying to solve?
- **Your idea** — How would you solve it?
- **Alternatives** — Any other solutions you considered?

---

## 🆘 Getting Help

Stuck? Don't hesitate to ask for help!

- **Comment on an issue** — Ask questions directly on the issue you're working on
- **Open a discussion** — For general questions or ideas
- **Reach out** — Contact maintainers if you need guidance

We'd rather help you succeed than have you give up. Seriously — ask away!

---

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone.

**Be kind. Be respectful. Be constructive.**

We do not tolerate:
- Harassment or discrimination
- Personal attacks
- Trolling or insulting comments

If you experience or witness unacceptable behavior, please report it to the maintainers.

---

## 🙏 Thank You!

Contributing to open source takes time and effort. Whether you're submitting your first PR or your hundredth, we're grateful you chose to spend that time with us.

Every contributor makes Know India better. **You're awesome!** 🌟

---

<div align="center">

**Happy Contributing!** 🇮🇳

</div>
