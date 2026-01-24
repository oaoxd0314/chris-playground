---
name: bdd-test-cases
description: Generate BDD (Behavior-Driven Development) format test cases for comprehensive testing scenarios. This skill should be used when creating test specifications, defining acceptance criteria, or planning test coverage for features.
---

# BDD Test Cases

Generate comprehensive test cases using BDD (GIVEN – WHEN – THEN) format.

## When to Use

- Creating test specifications for new features
- Defining acceptance criteria for user stories
- Planning test coverage before implementation
- Documenting expected behaviors for QA

## BDD Format

Each test case follows this structure:

```
**Scenario**: [Clear description of what is being tested]
- **GIVEN**: Initial conditions/setup
- **WHEN**: Action or event occurs
- **THEN**: Expected outcome/result
```

## Test Categories

### 1. Happy Path Scenarios

Normal user flows with expected inputs and behaviors.

```
**Scenario**: User successfully creates a new todo item
- **GIVEN**: User is logged in and on the todo list page
- **WHEN**: User enters "Buy groceries" and clicks Add
- **THEN**: New todo item appears in the list with "Buy groceries" text
```

### 2. Exception Path Scenarios

Error conditions, edge cases, and invalid inputs.

```
**Scenario**: User submits empty todo item
- **GIVEN**: User is on the todo list page
- **WHEN**: User clicks Add without entering text
- **THEN**: Error message "Todo item cannot be empty" is displayed
- **AND**: No new item is added to the list
```

### 3. Boundary Conditions

Testing limits and edge values.

```
**Scenario**: User creates todo with maximum length
- **GIVEN**: User is on the todo list page
- **WHEN**: User enters 500 characters (max limit) and clicks Add
- **THEN**: Todo item is created successfully

**Scenario**: User exceeds maximum todo length
- **GIVEN**: User is on the todo list page
- **WHEN**: User enters 501 characters and clicks Add
- **THEN**: Error message "Maximum 500 characters allowed" is displayed
```

## Generation Workflow

### Step 1: Identify Key Behaviors

Analyze the requirement to identify:

- Core functionality
- User interactions
- State changes
- Expected outputs

### Step 2: Generate Happy Path Tests

Cover the main success scenarios:

- Standard user flow
- Common use cases
- Expected data inputs

### Step 3: Generate Exception Path Tests

Cover failure scenarios:

- Invalid inputs (empty, too long, wrong format)
- Missing required data
- Unauthorized actions
- Network/server errors
- Concurrent access issues

### Step 4: Add Boundary Tests

Cover edge cases:

- Minimum/maximum values
- Empty lists/collections
- First/last items
- Zero quantities

### Step 5: Consider Integration Scenarios

Cover interactions:

- Component interactions
- Data flow between systems
- State management across views

## Output Format

Organize test cases by category:

```markdown
## Feature: [Feature Name]

### Happy Path Scenarios

**Scenario 1**: [Description]

- **GIVEN**: [Setup]
- **WHEN**: [Action]
- **THEN**: [Expected result]

**Scenario 2**: ...

### Exception Path Scenarios

**Scenario 1**: [Description]

- **GIVEN**: [Setup]
- **WHEN**: [Invalid action]
- **THEN**: [Error handling]

### Boundary Conditions

**Scenario 1**: [Description]

- **GIVEN**: [Edge case setup]
- **WHEN**: [Boundary action]
- **THEN**: [Expected behavior]
```

## Testing Focus Areas

When generating tests, consider:

| Focus Area           | Questions to Ask                        |
| -------------------- | --------------------------------------- |
| **Functionality**    | Does it work as expected?               |
| **User Experience**  | Is it intuitive? Is feedback clear?     |
| **Error Handling**   | How does it handle failures gracefully? |
| **Data Validation**  | Are inputs validated correctly?         |
| **State Management** | Are state transitions correct?          |
| **Accessibility**    | Can all users access the feature?       |

## Tips for Quality Test Cases

1. **Be Specific**: Avoid vague descriptions like "works correctly"
2. **One Behavior Per Test**: Each scenario tests one specific thing
3. **Measurable Outcomes**: THEN clauses should be verifiable
4. **Independent Tests**: Tests should not depend on each other
5. **Realistic Data**: Use realistic example data in scenarios
