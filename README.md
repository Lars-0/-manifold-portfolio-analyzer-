# Manifold Portfolio Analyzer

A simple web tool to analyze your [Manifold Markets](https://manifold.markets) portfolio and find positions where your potential return (if you're correct) is less than the margin loan rate.

## 🎯 What does this do?

Manifold offers margin loans at **0.03% per day (~10.9% annually)**. If you have positions where your annualized return (assuming you win) is lower than this rate, you might be better off selling and deploying that mana elsewhere.

This tool:
1. Fetches all your open positions from the Manifold API
2. Calculates the actual sale value using the AMM formula (accounting for slippage)
3. Computes the annualized "return if correct" for each position
4. Shows you all positions below the margin loan threshold

## 🚀 Live Demo

**[👉 Try it here](https://YOUR_USERNAME.github.io/manifold-portfolio-analyzer/)**

*(Replace `YOUR_USERNAME` with your GitHub username after deploying)*

You can also share a direct link to your analysis:
```
https://YOUR_USERNAME.github.io/manifold-portfolio-analyzer/?user=LarsOsborne
```

## 📦 Deploy Your Own Copy

### Step 1: Fork or Clone This Repository

Click the **Fork** button at the top right of this page, or clone it:

```bash
git clone https://github.com/YOUR_USERNAME/manifold-portfolio-analyzer.git
```

### Step 2: Enable GitHub Pages

1. Go to your forked repository on GitHub
2. Click **Settings** (gear icon in the top menu)
3. Scroll down to **Pages** in the left sidebar (under "Code and automation")
4. Under **Source**, select:
   - **Deploy from a branch**
   - Branch: **main** (or master)
   - Folder: **/ (root)**
5. Click **Save**

### Step 3: Wait a Minute

GitHub will build and deploy your site. You can check the progress in the **Actions** tab.

### Step 4: Access Your Site

Your site will be live at:
```
https://YOUR_USERNAME.github.io/manifold-portfolio-analyzer/
```

## 🔧 How It Works

### The Math

**Return If Correct** = (Payout - Sale Value) / Sale Value × (365 / Days Until Close)

Where:
- **Payout** = Your shares (if the market resolves in your favor, you get M$1 per share)
- **Sale Value** = What you'd get if you sold right now (calculated using the CPMM AMM formula)
- **Days Until Close** = Time until the market closes

### Why This Matters

If you have M$100 in a position that will pay out M$105 in 6 months (if you win), that's only a 10% annualized return. Since margin loans cost 10.9%/year, you'd actually lose money holding this position compared to selling and using margin loans for other bets.

## 📁 Files

```
manifold-portfolio-analyzer/
├── index.html       # Main HTML page
├── style.css        # Styling
├── app.js           # UI logic
├── manifold-api.js  # API calls and calculations
└── README.md        # This file
```

## 🤝 Contributing

Feel free to open issues or submit PRs! Some ideas for improvements:
- Add more analysis views (best positions, etc.)
- Export to CSV
- Dark mode
- Mobile optimization

## 📜 License

MIT License - do whatever you want with this code!

## ⚠️ Disclaimer

This tool is for informational purposes only. It's not financial advice. The calculations are approximations and may not exactly match what Manifold shows. Always verify important decisions on the actual Manifold website.

---

Built with ❤️ for the Manifold community
