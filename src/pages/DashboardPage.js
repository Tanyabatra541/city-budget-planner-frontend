import React, { useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from "axios";
import { Accordion, ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const categoriesList = [
  { name: "Housing", label: "Housing" },
  { name: "Utilities", label: "Utilities" },
  { name: "Food", label: "Food" },
  { name: "Transportation", label: "Transportation" },
  { name: "Health Insurance", label: "Health Insurance" },
  { name: "Cell Phone", label: "Cell Phone" },
  { name: "Fitness", label: "Fitness" },
  { name: "Entertainment", label: "Entertainment" },
  { name: "Miscellaneous", label: "Miscellaneous" },
  { name: "Savings", label: "Savings" },
];

const DashboardPage = () => {
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [budgetPlan, setBudgetPlan] = useState("");
  const [budgetBreakdown, setBudgetBreakdown] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(
    categoriesList.map((category) => category.name)
  );

  // Handle category selection toggling
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  // Handle budget generation with the selected categories
  const generateBudget = async () => {
    if (!budget || budget <= 0) {
      setMessage("Please enter a valid budget");
      return;
    }

    setLoading(true);
    setMessage("");

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const userToken = userInfo ? userInfo.token : null;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      };

      // Make API request to generate the budget based on user input
      const { data } = await axios.post(
        "/api/budget/generate",
        { city, budget, selectedCategories },
        config
      );

      console.log("Backend Response:", data);

      // Check if the data contains the necessary fields
      if (!data.budgetBreakdown || !Array.isArray(data.budgetBreakdown)) {
        throw new Error("Invalid response from backend");
      }

      setBudgetPlan(data.budgetPlan);

      const total = data.budgetBreakdown.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const parsedData = data.budgetBreakdown.map((item) => ({
        name: item.category,
        y: (item.amount / total) * 100,
        amount: item.amount,
      }));

      setBudgetBreakdown(data.budgetBreakdown); // Set budget breakdown
      setChartData(parsedData); // Set chart data
      setLoading(false);
    } catch (error) {
      setMessage("Failed to generate budget plan");
      console.error("Error generating budget plan:", error);
      setLoading(false);
    }
  };

  // Pie chart configuration
  const chartOptions = {
    chart: {
      type: "pie",
    },
    title: {
      text: `Budget Breakdown for ${city || "the selected city"}`,
    },
    tooltip: {
      pointFormat:
        "<b>{point.name}</b>: {point.y:.1f}%<br/>Amount: ${point.amount:.2f}",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format:
            "<b>{point.name}</b>: {point.percentage:.1f}% ({point.amount:.2f} USD)",
        },
      },
    },
    series: [
      {
        name: "Budget",
        colorByPoint: true,
        data: chartData.map((item) => ({
          name: item.name,
          y: (item.amount / budget) * 100,
          amount: item.amount,
        })),
      },
    ],
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h2 className="text-center mb-4">Generate Budget Plan</h2>
          {message && <p className="alert alert-danger">{message}</p>}

          {/* Form to enter city and budget */}
          <div className="card p-4 mb-4">
            <div className="form-group mb-3">
              <label htmlFor="city" className="form-label">
                City Name
              </label>
              <input
                type="text"
                id="city"
                className="form-control"
                placeholder="Enter City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="budget" className="form-label">
                Total Budget ($)
              </label>
              <input
                type="number"
                id="budget"
                className="form-control"
                placeholder="Enter Budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            {/* Category Selection */}
            <div className="mb-4">
              <h4>Select Expenses to Include:</h4>
              <div className="row">
                {categoriesList.map((category) => (
                  <div className="col-md-4" key={category.name}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={category.name}
                        checked={selectedCategories.includes(category.name)}
                        onChange={() => handleCategoryChange(category.name)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={category.name}
                      >
                        {category.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={generateBudget}
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>

          {/* Budget Summary */}
          {budgetPlan && (
            <div className="card p-4 mt-4">
              <h4>Budget Plan:</h4>

              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>View Budget Breakdown</Accordion.Header>
                  <Accordion.Body>
                    <pre className="whitespace-pre-wrap">{budgetPlan}</pre>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          )}

          {/* Progress Bars for Each Category */}
          {budgetBreakdown.length > 0 && !loading && (
            <div className="card p-4 mt-4">
              <h4>Budget Progress</h4>
              {budgetBreakdown.map((item) => (
                <div key={item.category}>
                  <h5>{item.category}</h5>
                  <ProgressBar
                    now={(item.amount / budget) * 100}
                    label={`${item.amount} USD (${(
                      (item.amount / budget) *
                      100
                    ).toFixed(2)}%)`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pie Chart */}
          {chartData.length > 0 && !loading && (
            <div className="card p-4 mt-4">
              <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
