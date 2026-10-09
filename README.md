# BudgetU

BudgetU is an interactive budgeting simulator designed for students. It allows users to experiment with income, expenses and savings in a risk-free environment, so they can see how financial decisions affect their monthly balance before those decisions are made in real life.

**Live site** https://budget-simulator-red.vercel.app

## Features

- Enter income from several sources and switch between monthly and annual views
- Adjust seven student expense categories, including rent, groceries and subscriptions, using sliders
- View a live summary of total income, total expenses, remaining balance, savings rate and a financial health score
- Compare income against expenses with a bar chart
- Explore an expense breakdown with an interactive donut chart and tooltips
- Load one of three student lifestyle scenario presets to compare spending habits
- Use the affordability calculator to see how many months of saving a purchase would require, including existing savings

## Privacy

BudgetU does not require an account and does not collect, store or transmit any data. All calculations run locally in the browser.

## Built With

- HTML
- CSS
- JavaScript (no frameworks or external libraries)

## Project Structure

```
budget-simulator/
├── index.html          Home page
├── pages/
│   ├── about.html      About page
│   └── simulator.html  Budget simulator
└── src/
    ├── css/
    │   ├── style.css       Styles for the home page
    │   ├── about.css       Styles for the about page
    │   └── simulator.css   Styles for the simulator
    └── js/
        └── script.js       Simulator logic
```

## Running Locally

1. Clone the repository.

   ```bash
   git clone https://github.com/kaleena-y/budget-simulator.git
   ```

2. Open the project folder.

   ```bash
   cd budget-simulator
   ```

3. Open `index.html` in a browser. Alternatively, use the Live Server extension in VS Code by right-clicking `index.html` and choosing Open with Live Server.

No installation or build step is required.

## Deployment

The site is deployed on Vercel. Every push to the `master` branch updates the live site automatically.

## Author

Created by Kaleena ([@kaleena-y](https://github.com/kaleena-y)).
