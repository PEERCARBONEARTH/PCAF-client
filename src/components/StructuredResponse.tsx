import React from 'react';
import { 
  RAGResponse, 
  StepByStepResponse, 
  ComparisonTableResponse, 
  FormulaResponse,
  ChecklistResponse,
  DataRequirementsResponse,
  ComplianceMatrixResponse,
  PortfolioSummaryResponse 
} from '../types/ragTypes';

interface StructuredResponseProps {
  response: RAGResponse;
}

export const StructuredResponse: React.FC<StructuredResponseProps> = ({ response }) => {
  const { structuredData, confidence, sources, followUpQuestions } = response;

  return (
    <div className="structured-response">
      {/* Confidence Indicator */}
      <div className={`confidence-badge confidence-${confidence}`}>
        <span className="confidence-icon">
          {confidence === 'high' ? '🎯' : confidence === 'medium' ? '📊' : '💡'}
        </span>
        <span className="confidence-text">
          {confidence === 'high' ? 'High Confidence' : 
           confidence === 'medium' ? 'Medium Confidence' : 'General Information'}
        </span>
      </div>

      {/* Main Content */}
      <div className="response-content">
        {structuredData ? (
          <StructuredContent data={structuredData} />
        ) : (
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(response.response) }} />
        )}
      </div>

      {/* Portfolio Insights */}
      {response.portfolioInsights && (
        <PortfolioInsightsCard insights={response.portfolioInsights} />
      )}

      {/* Sources */}
      <div className="sources-section">
        <h4>📚 Sources</h4>
        <div className="sources-list">
          {sources.map((source, index) => (
            <span key={index} className="source-tag">{source}</span>
          ))}
        </div>
      </div>

      {/* Follow-up Questions */}
      <div className="followup-section">
        <h4>❓ Related Questions</h4>
        <div className="followup-questions">
          {followUpQuestions.map((question, index) => (
            <button key={index} className="followup-button" onClick={() => handleFollowUpClick(question)}>
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const StructuredContent: React.FC<{ data: any }> = ({ data }) => {
  switch (data.format) {
    case 'step_by_step':
      return <StepByStepRenderer data={data.data} />;
    case 'comparison_table':
      return <ComparisonTableRenderer data={data.data} />;
    case 'formula':
      return <FormulaRenderer data={data.data} />;
    case 'checklist':
      return <ChecklistRenderer data={data.data} />;
    case 'data_requirements':
      return <DataRequirementsRenderer data={data.data} />;
    case 'compliance_matrix':
      return <ComplianceMatrixRenderer data={data.data} />;
    case 'portfolio_summary':
      return <PortfolioSummaryRenderer data={data.data} />;
    default:
      return <div>Unsupported format</div>;
  }
};

const StepByStepRenderer: React.FC<{ data: StepByStepResponse }> = ({ data }) => (
  <div className="step-by-step">
    <h3>{data.title}</h3>
    <div className="steps-container">
      {data.steps.map((step, index) => (
        <div key={index} className="step-item">
          <div className="step-number">{step.number}</div>
          <div className="step-content">
            <h4>{step.title}</h4>
            <p>{step.description}</p>
            {step.example && (
              <div className="step-example">
                <strong>Example:</strong> {step.example}
              </div>
            )}
            {step.tips && step.tips.length > 0 && (
              <div className="step-tips">
                <strong>Tips:</strong>
                <ul>
                  {step.tips.map((tip, tipIndex) => (
                    <li key={tipIndex}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
    <div className="step-summary">
      <strong>Summary:</strong> {data.summary}
    </div>
  </div>
);

const ComparisonTableRenderer: React.FC<{ data: ComparisonTableResponse }> = ({ data }) => (
  <div className="comparison-table">
    <h3>{data.title}</h3>
    <div className="table-container">
      <table className="comparison-table-element">
        <thead>
          <tr>
            {data.headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, index) => (
            <tr key={index} className={row.highlight ? 'highlighted-row' : ''}>
              <td className="row-label">{row.label}</td>
              {row.values.map((value, valueIndex) => (
                <td key={valueIndex}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {data.notes && data.notes.length > 0 && (
      <div className="table-notes">
        <h4>Notes:</h4>
        <ul>
          {data.notes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const FormulaRenderer: React.FC<{ data: FormulaResponse }> = ({ data }) => (
  <div className="formula-display">
    <h3>{data.title}</h3>
    <div className="formula-container">
      <div className="formula-equation">
        <code>{data.formula}</code>
      </div>
      <div className="formula-variables">
        <h4>Variables:</h4>
        <div className="variables-grid">
          {data.variables.map((variable, index) => (
            <div key={index} className="variable-item">
              <span className="variable-symbol">{variable.symbol}</span>
              <div className="variable-details">
                <strong>{variable.name}</strong>
                <p>{variable.description}</p>
                {variable.unit && <span className="variable-unit">Unit: {variable.unit}</span>}
                {variable.example && <span className="variable-example">Example: {variable.example}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="formula-example">
        <h4>Example Calculation:</h4>
        <div className="example-scenario">{data.example.scenario}</div>
        <div className="example-calculation">
          <code>{data.example.calculation}</code>
        </div>
        <div className="example-result">{data.example.result}</div>
      </div>
    </div>
  </div>
);

const ChecklistRenderer: React.FC<{ data: ChecklistResponse }> = ({ data }) => (
  <div className="checklist">
    <h3>{data.title}</h3>
    {data.categories.map((category, categoryIndex) => (
      <div key={categoryIndex} className="checklist-category">
        <h4>{category.category}</h4>
        <div className="checklist-items">
          {category.items.map((item, itemIndex) => (
            <div key={itemIndex} className="checklist-item">
              <input 
                type="checkbox" 
                id={`item-${categoryIndex}-${itemIndex}`}
                className="checklist-checkbox"
              />
              <label htmlFor={`item-${categoryIndex}-${itemIndex}`} className="checklist-label">
                <span className="item-text">{item.item}</span>
                {item.required && <span className="required-badge">Required</span>}
              </label>
              {item.description && (
                <div className="item-description">{item.description}</div>
              )}
              {item.example && (
                <div className="item-example">Example: {item.example}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const DataRequirementsRenderer: React.FC<{ data: DataRequirementsResponse }> = ({ data }) => (
  <div className="data-requirements">
    <h3>{data.title}</h3>
    <div className="requirements-grid">
      {data.options.map((option, index) => (
        <div key={index} className="requirement-card">
          <div className="requirement-header">
            <h4>{option.option}</h4>
            <div className="requirement-score">Score: {option.score}</div>
          </div>
          <div className="requirement-metrics">
            <span className="metric accuracy">Accuracy: {option.accuracy}</span>
            <span className="metric effort">Effort: {option.effort}</span>
          </div>
          <div className="requirement-fields">
            {option.requirements.map((req, reqIndex) => (
              <div key={reqIndex} className="requirement-field">
                <div className="field-header">
                  <strong>{req.field}</strong>
                  <span className={`difficulty-badge difficulty-${req.difficulty}`}>
                    {req.difficulty}
                  </span>
                </div>
                <p>{req.description}</p>
                <div className="field-source">Source: {req.source}</div>
                {req.example && <div className="field-example">Example: {req.example}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ComplianceMatrixRenderer: React.FC<{ data: ComplianceMatrixResponse }> = ({ data }) => (
  <div className="compliance-matrix">
    <h3>{data.title}</h3>
    <div className="compliance-requirements">
      {data.requirements.map((req, index) => (
        <div key={index} className="compliance-requirement">
          <div className="requirement-header">
            <h4>{req.requirement}</h4>
            <span className={`requirement-badge ${req.mandatory ? 'mandatory' : 'optional'}`}>
              {req.mandatory ? 'Mandatory' : 'Optional'}
            </span>
            {req.status && (
              <span className={`status-badge status-${req.status.replace('_', '-')}`}>
                {req.status.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </div>
          <p>{req.description}</p>
          {req.deadline && (
            <div className="requirement-deadline">Deadline: {req.deadline}</div>
          )}
          <div className="requirement-documentation">
            <h5>Required Documentation:</h5>
            <ul>
              {req.documentation.map((doc, docIndex) => (
                <li key={docIndex}>{doc}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PortfolioSummaryRenderer: React.FC<{ data: PortfolioSummaryResponse }> = ({ data }) => (
  <div className="portfolio-summary">
    <h3>{data.title}</h3>
    <div className="metrics-section">
      <h4>📊 Key Metrics</h4>
      <div className="metrics-grid">
        {data.metrics.map((metric, index) => (
          <div key={index} className={`metric-card metric-${metric.status}`}>
            <div className="metric-header">
              <span className="metric-name">{metric.metric}</span>
              <span className={`status-icon status-${metric.status}`}>
                {metric.status === 'good' ? '✅' : metric.status === 'warning' ? '⚠️' : '❌'}
              </span>
            </div>
            <div className="metric-value">{metric.value}</div>
            {metric.target && <div className="metric-target">Target: {metric.target}</div>}
            {metric.improvement && <div className="metric-improvement">{metric.improvement}</div>}
          </div>
        ))}
      </div>
    </div>
    <div className="recommendations-section">
      <h4>🎯 Recommendations</h4>
      <div className="recommendations-list">
        {data.recommendations.map((rec, index) => (
          <div key={index} className={`recommendation-item priority-${rec.priority}`}>
            <div className="recommendation-header">
              <span className={`priority-badge priority-${rec.priority}`}>
                {rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'}
                {rec.priority.toUpperCase()}
              </span>
            </div>
            <div className="recommendation-content">
              <h5>{rec.action}</h5>
              <div className="recommendation-details">
                <span>Impact: {rec.impact}</span>
                <span>Effort: {rec.effort}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PortfolioInsightsCard: React.FC<{ insights: any }> = ({ insights }) => (
  <div className="portfolio-insights-card">
    <h4>🎯 Portfolio Insights</h4>
    <div className="insights-grid">
      <div className="insight-item">
        <span className="insight-label">Compliance Status</span>
        <span className={`insight-value status-${insights.complianceStatus}`}>
          {insights.complianceStatus === 'compliant' ? '✅ Compliant' : 
           insights.complianceStatus === 'partial' ? '⚠️ Partial' : '❌ Non-Compliant'}
        </span>
      </div>
      <div className="insight-item">
        <span className="insight-label">Current Score</span>
        <span className="insight-value">{insights.currentScore?.toFixed(1) || 'N/A'}</span>
      </div>
      <div className="insight-item">
        <span className="insight-label">Quick Wins Available</span>
        <span className="insight-value">{insights.quickWins || 0}</span>
      </div>
    </div>
  </div>
);

// Helper functions
const formatMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
};

const handleFollowUpClick = (question: string) => {
  // This would trigger a new query with the follow-up question
  console.log('Follow-up question clicked:', question);
  // Implementation depends on your chat system
};

export default StructuredResponse;