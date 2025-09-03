# AI Co-Pilot Output Format Specification

## Overview
The AI Co-Pilot uses a comprehensive, structured output format that provides rich, interactive responses with multiple components for enhanced user experience and information delivery.

## Message Structure

### Core Message Interface
```typescript
interface ChatMessage {
  id: string;                    // Unique message identifier
  role: 'user' | 'assistant';    // Message sender type
  content: string;               // Main response content
  timestamp: Date;               // When message was created
  sources?: Array<{              // Optional source citations
    title: string;               // Source document name
    content: string;             // Source excerpt/description
    relevance: number;           // Relevance score (0-1)
  }>;
  followUpQuestions?: string[];  // Optional suggested follow-up questions
  confidence?: number;           // AI confidence score (0-1)
}
```

## Visual Output Components

### 1. Main Response Content
**Format:** Rich text with line breaks and formatting
**Display:** 
- User messages: Blue bubble on right side
- AI messages: Gray bubble on left side with Bot avatar
- Prose formatting with proper line breaks
- Maximum width of 3xl for readability

**Example:**
```
PCAF data quality options (1-5, best to worst):

Option 1: Real fuel consumption data
Option 2: Estimated fuel consumption from mileage  
Option 3: Vehicle specifications + average mileage
Option 4: Vehicle type + average factors
Option 5: Asset class average

Always aim for the highest option possible to achieve better data quality scores.
```

### 2. Confidence Score Badge
**Format:** Percentage badge (0-100%)
**Display:** Small secondary badge below message
**Color Coding:**
- 90-100%: High confidence (green)
- 70-89%: Medium confidence (yellow)
- <70%: Lower confidence (orange)

**Example:**
```
[Confidence: 95%]
```

### 3. Source Citations
**Format:** Expandable source cards with relevance scores
**Display:** 
- Up to 3 sources shown by default
- Each source shows title, excerpt, and relevance percentage
- Bordered cards with primary accent color
- Truncated content with "..." for longer sources

**Example:**
```
📄 Sources (3)
┌─────────────────────────────────────────────┐
│ PCAF Global Standard                    95% │
│ Reference from PCAF Global Standard        │
│ Partnership for Carbon Accounting...       │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Motor Vehicle Methodology               88% │
│ Reference from Motor Vehicle Methodology   │
│ Specific guidance for automotive...        │
└─────────────────────────────────────────────┘
```

### 4. Follow-up Questions
**Format:** Clickable button chips
**Display:**
- Horizontal scrollable row of buttons
- Small outline buttons with hover effects
- Click to auto-populate input field
- Contextually relevant to the response topic

**Example:**
```
💡 Suggested questions
[How to move from option 5 to 4?] [What data is needed for option 3?] [Option 1 vs option 2 comparison?]
```

### 5. Message Metadata
**Format:** Small text with timestamp and actions
**Display:**
- Timestamp in local time format
- Action buttons for assistant messages: Copy, Thumbs Up, Thumbs Down
- Subtle gray text styling

**Example:**
```
🕐 2:34:15 PM                    [📋] [👍] [👎]
```

## Response Flow Types

### 1. ChromaDB RAG Response
**Primary response type when ChromaDB is available**
```json
{
  "content": "Detailed PCAF methodology explanation...",
  "sources": [
    {
      "title": "PCAF Global Standard",
      "content": "Reference from PCAF Global Standard",
      "relevance": 0.95
    }
  ],
  "confidence": 0.95,
  "followUpQuestions": [
    "How to calculate WDQS?",
    "What are attribution factors?"
  ]
}
```

### 2. OpenAI GPT-4 Response
**Secondary response type with real AI**
```json
{
  "content": "AI-generated PCAF guidance with calculations...",
  "sources": [
    "PCAF Attribution Methodology",
    "Calculation Examples"
  ],
  "confidence": 0.9,
  "followUpQuestions": [
    "How do I get accurate asset values?",
    "What if the asset value is unknown?"
  ],
  "metadata": {
    "model": "gpt-4",
    "tokensUsed": 850,
    "processingTime": 2400
  }
}
```

### 3. Static Fallback Response
**Tertiary response type for basic queries**
```json
{
  "content": "Pattern-matched PCAF response...",
  "sources": ["PCAF Global Standard"],
  "confidence": 0.8,
  "followUpQuestions": [
    "What are PCAF data options?",
    "How to calculate attribution factors?"
  ]
}
```

## Interactive Elements

### 1. Suggested Prompts (Welcome Screen)
**Format:** Card grid with icons and descriptions
**Display:** 2x2 grid of clickable cards
**Content:** Pre-defined PCAF methodology prompts

```
┌─────────────────────┐ ┌─────────────────────┐
│ 🧮 PCAF Methodology │ │ 📊 Portfolio Analysis│
│ Explain the PCAF... │ │ Analyze my current...│
└─────────────────────┘ └─────────────────────┘
┌─────────────────────┐ ┌─────────────────────┐
│ ✅ Compliance Check │ │ 📈 Data Quality     │
│ What are the key... │ │ How can I improve...│
└─────────────────────┘ └─────────────────────┘
```

### 2. Loading States
**Format:** Animated typing indicator
**Display:** Three bouncing dots with bot avatar
**Animation:** Staggered bounce animation

```
🤖 ● ● ●  (animated)
```

### 3. Error States
**Format:** Error message with retry option
**Display:** Red-tinted message with error icon
**Actions:** Retry button or fallback suggestion

## Session Management

### Session Header Format
```
📋 Session Title                           🟢 OpenAI GPT-4
3 messages • Updated 2:34 PM
```

### Session List Format
```
📝 PCAF Methodology Overview
   3 messages
   Today 2:34 PM                          [🗑️]

📝 Data Quality Assessment  
   7 messages
   Yesterday 4:15 PM                      [🗑️]
```

## Status Indicators

### Connection Status Badge
**Formats:**
- `🟢 OpenAI GPT-4` - Real AI responses enabled
- `🟡 Static Responses` - Fallback mode active
- `🔴 Offline` - No AI services available

### Compliance Badge
**Format:** `✅ PCAF Compliant` - Always shown to indicate methodology compliance

## Responsive Design

### Desktop Layout
- Full-screen interface with sidebar
- Maximum content width: 4xl (896px)
- Two-column layout: sidebar (320px) + main content

### Mobile Layout
- Collapsible sidebar overlay
- Single-column message flow
- Touch-optimized buttons and interactions
- Responsive card grids (2x2 → 1x4)

## Accessibility Features

### Screen Reader Support
- Proper ARIA labels for all interactive elements
- Semantic HTML structure with headings
- Alt text for icons and visual elements

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter key to send messages
- Shift+Enter for new lines
- Escape to close modals/overlays

### Visual Accessibility
- High contrast color schemes
- Scalable text and UI elements
- Clear visual hierarchy
- Color-blind friendly indicators

## Performance Considerations

### Message Rendering
- Virtualized scrolling for long conversations
- Lazy loading of source content
- Optimized re-renders with React keys

### Content Loading
- Progressive enhancement of rich content
- Skeleton loading states
- Graceful degradation for slow connections

This comprehensive output format ensures users receive rich, interactive, and accessible AI responses with proper context, sources, and follow-up guidance for PCAF methodology questions.