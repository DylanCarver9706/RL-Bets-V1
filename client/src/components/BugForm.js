import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJiraIssue } from "../services/jiraService";
import { useUser } from "../contexts/UserContext.js";

const BugForm = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // State variables for inputs
  const [summary, setSummary] = useState("");
  const [steps, setSteps] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [frequency, setFrequency] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [browser, setBrowser] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!summary || !steps || !expectedBehavior || !actualBehavior) {
      setError("Please fill out all required fields.");
      return;
    }

    if (summary.length > 255) {
      setError("Summary cannot exceed 255 characters.");
      return;
    }

    if (
      !steps ||
      !expectedBehavior ||
      !actualBehavior ||
      !frequency ||
      !deviceType ||
      !browser
    ) {
      setError("Ensure all required fields are filled out.");
      return;
    }

    // Compile the description
    const description = `Steps to Reproduce:\n${steps.trim()}\n\nExpected Behavior:\n${expectedBehavior.trim()}\n\nActual Behavior:\n${actualBehavior.trim()}\n\nFrequency:\n${frequency}\n\nDevice Type:\n${deviceType.trim()}\n\nBrowser:\n${browser.trim()}\n\nError Messages:\n${errorMessages.trim()}\n\nAdditional Context:\n${additionalContext.trim()}`;

    try {
      const response = await createJiraIssue(
        user?.name || "Unknown",
        user?.email || "Unknown",
        user?.mongoUserId || "Unknown",
        "Problem Report",
        summary,
        description,
        "Beta Tester Feedback - Problem Reports"
      );

      if (response.status === 200) {
        alert("Bug report submitted successfully!");
        navigate("/Wagers");
      }
    } catch (error) {
      alert("Failed to submit bug report. Please try again.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Report a Bug</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h3>All fields marked with a "*" are required.</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Summary*</label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Steps to Reproduce*</label>
          <textarea
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Expected Behavior*</label>
          <textarea
            value={expectedBehavior}
            onChange={(e) => setExpectedBehavior(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Actual Behavior*</label>
          <textarea
            value={actualBehavior}
            onChange={(e) => setActualBehavior(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Frequency*</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <option value="">Select An Option</option>
            <option value="Every Time">Every Time</option>
            <option value="Intermittent">Intermittent</option>
          </select>
        </div>
        <div>
          <label>Device Type*</label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <option value="">Select An Option</option>
            <option value="PC">PC</option>
            <option value="Mac">Mac</option>
            <option value="Android">Android</option>
            <option value="iPhone">iPhone</option>
          </select>
        </div>
        <div>
          <label>Browser*</label>
          <select
            value={browser}
            onChange={(e) => setBrowser(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            <option value="">Select An Option</option>
            <option value="Chrome">Chrome</option>
            <option value="Safari">Safari</option>
            <option value="Edge">Edge</option>
            <option value="Firefox">Firefox</option>
            <option value="Internet Explorer">Internet Explorer</option>
          </select>
        </div>
        <div>
          <label>Error Messages Shown When It Happened (If Any)</label>
          <textarea
            value={errorMessages}
            onChange={(e) => setErrorMessages(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>
        <div>
          <label>Anything Else We Should Know?</label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </div>
        <button type="submit">Submit Bug</button>
      </form>
    </div>
  );
};

export default BugForm;
