import React, { useEffect, useState } from "react";
import { fetchSeasonDataTree } from "../services/wagerService";

const SeasonDataTree = () => {
  // Load data
  const [data, setData] = useState(null);
  const seasonId = "66fa1588cbd894f17aa0363a"; // Hardcoded for demonstration; replace with dynamic as needed

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await fetchSeasonDataTree(seasonId);
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, [seasonId]);

  // Collapsible component to handle toggling
  const CollapsibleSection = ({ title, children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
      <div style={{ marginLeft: "20px", marginTop: "10px" }}>
        <button
          style={{
            marginBottom: "5px",
            background: "#b3b1b1",
            color: "white",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "▶" : "▼"} {title}
        </button>
        {!isCollapsed && <div style={{ paddingLeft: "15px" }}>{children}</div>}
      </div>
    );
  };

  // Function to render the results object as a table
  const renderResultsTable = (results) => {
    // Get the player names (columns) and attributes (rows)
    const playerNames = Object.keys(results);
    const attributes = Object.keys(results[playerNames[0]] || {});
  
    // Calculate the split index to insert the attribute header
    const halfIndex = Math.ceil(playerNames.length / 2);
  
    return (
      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            {/* Render the player names and insert the attribute column in the middle */}
            {playerNames.map((player, index) => (
              <React.Fragment key={player}>
                {index === halfIndex && (
                  <th style={{ border: "1px solid #ddd", padding: "8px", background: "#b3b1b1" }}>Attribute</th>
                )}
                <th style={{ border: "1px solid #ddd", padding: "8px", background: "#b3b1b1" }}>{player}</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {attributes.map((attribute) => (
            <tr key={attribute}>
              {/* Render the values for each player and insert the attribute name in the middle */}
              {playerNames.map((player, index) => (
                <React.Fragment key={player}>
                  {index === halfIndex && (
                    <td style={{ border: "1px solid #ddd", padding: "8px", background: "#b3b1b1" }}>
                      <strong>{attribute.charAt(0).toUpperCase() + attribute.slice(1)}</strong>
                    </td>
                  )}
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{results[player][attribute]}</td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Recursive render function to display nested data
  const renderDataTree = (node, level = 0) => {
    if (!node || typeof node !== "object") return null;
  
    if (Array.isArray(node)) {
      return (
        <ul style={{ listStyleType: "none", paddingLeft: level > 0 ? "20px" : "0" }}>
          {node.map((item, index) => (
            <li key={index}>{renderDataTree(item, level + 1)}</li>
          ))}
        </ul>
      );
    } else {
      return (
        <div>
          {Object.entries(node)
            .filter(([key, value]) => {
              // Exclude keys like "_id", "id", or reference fields that contain IDs
              const excludedKeys = ["_id", "id", "season", "tournament", "series", "team"];
              return !excludedKeys.includes(key) || typeof value !== "string";
            })
            .map(([key, value]) => {
              // Determine the collapsible title based on the key
              let title = "";
              if (key === "tournaments") title = "Tournaments";
              else if (key === "series") title = "Series";
              else if (key === "matches") title = "Matches";
              else if (key === "teams") title = "Teams";
              else if (key === "players") title = "Players";
              else if (key === "results") title = "Results";
  
              // Handle series: include team names in the series title if they exist
              if (key === "series" && Array.isArray(value)) {
                return value.map((seriesItem) => {
                  const seriesId = seriesItem._id;
                  const seriesName = seriesItem.name || "Series";
                  
                  // If the series has teams, extract their names
                  const teamNames = (seriesItem.teams || []).map((team) => team.name).join(" vs ");
                  const seriesTitle = teamNames ? `${seriesName}: [${teamNames}]` : seriesName;
  
                  // Render the series with the updated title
                  return (
                    <CollapsibleSection key={seriesId} title={seriesTitle}>
                      {renderDataTree(seriesItem, level + 1, key)}
                    </CollapsibleSection>
                  );
                });
              }
  
              // Skip rendering teams directly under matches or series
              if (key === "teams") {
                return null;
              }
  
              // Render results as a table
              if (key === "results" && typeof value === "object") {
                return (
                  <CollapsibleSection key={key} title={title || key}>
                    {renderResultsTable(value)}
                  </CollapsibleSection>
                );
              }
  
              // Recursively render if the value is an object or array
              return typeof value === "object" ? (
                <CollapsibleSection key={key} title={title || key}>
                  {renderDataTree(value, level + 1, key)}
                </CollapsibleSection>
              ) : (
                <div key={key} style={{ marginBottom: "5px" }}>
                  <strong>{value}</strong>
                </div>
              );
            })}
        </div>
      );
    }
  };

  return (
    <div>
      {data ? <div>{renderDataTree(data)}</div> : <p>Failed to load data.</p>}
      
    </div>
  );
};

export default SeasonDataTree;
