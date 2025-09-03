# AI Co-Pilot Semantic Accuracy Testing Guide

## Overview
This guide focuses on testing the AI Co-Pilot's semantic understanding and conceptual accuracy rather than simple keyword matching. The goal is to ensure the AI provides technically accurate, contextually appropriate, and conceptually sound responses about PCAF methodology.

## Semantic Testing Framework

### 1. Conceptual Understanding
**What to Test:**
- Does the AI correctly understand the fundamental concepts?
- Are relationships between concepts properly explained?
- Is the technical accuracy maintained throughout the response?

**Example Evaluation:**
```
Query: "What are PCAF data quality options?"

✅ GOOD Response:
"PCAF defines 5 data quality options in a hierarchy where Option 1 represents the highest quality (using real fuel consumption data) and Option 5 represents the lowest quality (using asset class averages). The option you use depends on what data is available for each loan..."

❌ POOR Response:
"There are 5 options: Option 1, Option 2, Option 3, Option 4, and Option 5."
```

### 2. Technical Accuracy
**What to Test:**
- Are formulas and calculations correct?
- Are numerical thresholds accurately stated?
- Are technical terms used properly?

**Key PCAF Facts to Verify:**
- WDQS compliance threshold: ≤ 3.0 (not 3.5 or "around 3")
- Attribution Factor formula: Outstanding Balance ÷ Asset Value
- Data quality hierarchy: 1 = best, 5 = worst (inverse relationship)
- Scope 3 Category 15 for financed emissions reporting

### 3. Contextual Relevance
**What to Test:**
- Does the response address the user's actual need?
- Is practical guidance provided alongside theory?
- Are implications and next steps explained?

**Example Evaluation:**
```
Query: "How do I improve my portfolio data quality?"

✅ GOOD Response:
"To improve your portfolio data quality score, focus on collecting additional vehicle data to move from higher-numbered to lower-numbered PCAF options. Start with high-value loans where the impact will be greatest. For example, collecting make/model/year data moves you from Option 5 to Option 4..."

❌ POOR Response:
"You need better data quality. Collect more information about vehicles."
```

## Testing Scenarios

### Scenario 1: PCAF Methodology Fundamentals
**Test Query:** "Explain the PCAF data quality hierarchy"

**Semantic Accuracy Criteria:**
- ✅ Correctly explains 5-tier system (Options 1-5)
- ✅ States that Option 1 is highest quality, Option 5 is lowest
- ✅ Explains that data availability determines which option applies
- ✅ Mentions that lower option numbers result in better data quality scores
- ✅ Provides examples of data requirements for different options

### Scenario 2: Practical Application
**Test Query:** "My portfolio has mostly Option 5 loans. What should I do?"

**Semantic Accuracy Criteria:**
- ✅ Recognizes this indicates limited vehicle data
- ✅ Suggests collecting make/model/year to reach Option 4
- ✅ Recommends prioritizing high-value loans first
- ✅ Explains the compliance benefits of improvement
- ✅ Provides realistic timeline expectations

### Scenario 3: Technical Calculations
**Test Query:** "How do I calculate attribution factors for a $25k loan on a $40k vehicle?"

**Semantic Accuracy Criteria:**
- ✅ States the correct formula: Outstanding Balance ÷ Asset Value
- ✅ Performs the calculation: $25,000 ÷ $40,000 = 0.625 (62.5%)
- ✅ Explains what this percentage means (proportional responsibility)
- ✅ Describes how this fits into the broader emissions calculation
- ✅ Mentions considerations for asset valuation

### Scenario 4: Compliance Requirements
**Test Query:** "What PCAF compliance requirements must I meet?"

**Semantic Accuracy Criteria:**
- ✅ States WDQS ≤ 3.0 threshold accurately
- ✅ Explains portfolio-weighted calculation concept
- ✅ Mentions Scope 3 Category 15 reporting
- ✅ Describes documentation and transparency requirements
- ✅ Provides guidance on achieving compliance

## Evaluation Rubric

### Excellent (90-100%)
- All key concepts correctly explained
- Technical details are accurate and complete
- Practical guidance is actionable and relevant
- Response demonstrates deep understanding
- Sources are appropriately cited

### Good (70-89%)
- Most concepts correctly explained
- Minor technical inaccuracies or omissions
- Generally practical and relevant
- Shows solid understanding
- Sources are mostly appropriate

### Needs Improvement (50-69%)
- Some concepts correctly explained
- Notable technical errors or gaps
- Limited practical value
- Understanding appears superficial
- Sources may be irrelevant or missing

### Poor (Below 50%)
- Major conceptual errors
- Significant technical inaccuracies
- Not practically useful
- Demonstrates poor understanding
- Sources are inappropriate or absent

## Red Flags to Watch For

### Technical Errors
- ❌ Stating WDQS threshold as anything other than ≤ 3.0
- ❌ Confusing data quality option numbers (saying Option 5 is best)
- ❌ Incorrect attribution factor formula
- ❌ Wrong scope category for financed emissions

### Conceptual Misunderstandings
- ❌ Not understanding the inverse relationship between option numbers and quality
- ❌ Confusing financed emissions with other emission types
- ❌ Misrepresenting the purpose of attribution factors
- ❌ Incorrect explanation of PCAF compliance requirements

### Poor Practical Guidance
- ❌ Vague recommendations without specific steps
- ❌ Ignoring cost-benefit considerations
- ❌ Not prioritizing high-impact improvements
- ❌ Failing to consider implementation challenges

## Testing Protocol

1. **Prepare Test Environment**
   - Navigate to AI Co-Pilot interface
   - Ensure ChromaDB connection is active
   - Clear any previous chat history

2. **Execute Test Queries**
   - Ask each test question exactly as written
   - Allow full response generation
   - Do not interrupt or modify queries

3. **Evaluate Semantic Accuracy**
   - Check each response against the criteria above
   - Score using the evaluation rubric
   - Document specific strengths and weaknesses

4. **Test Follow-up Understanding**
   - Ask clarifying questions based on the response
   - Test edge cases and complex scenarios
   - Verify consistency across related topics

5. **Document Results**
   - Record semantic accuracy scores
   - Note specific technical errors
   - Identify patterns in understanding gaps
   - Recommend improvements if needed

This semantic testing approach ensures the AI Co-Pilot provides genuinely helpful, accurate, and contextually appropriate guidance for PCAF methodology implementation.