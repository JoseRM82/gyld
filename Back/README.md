# Gyld Player Sorter

A system for assigning players to balanced teams for the Gyld platform with multiple sorting types.

## How to run

```bash
# Install dependencies
npm install

# Run with default number of teams (3) and events_performance sort
npm start

# Run with specific number of teams and events_performance sort
npm start -- --teams 4

# Run with events performance sort (average points per event)
npm start -- --events_performance --teams 3

# Run with total message length sort
npm start -- --messages_length --teams 4

# Run with total points spent sort
npm start -- --points_spent --teams 5
```

## Available Sort Types

### 1. events_performance (default)
**Metric**: Average points per event (`historical_points_earned / historical_event_engagements`)
**File**: `level_a_players.csv`
**Description**: Sorts players by their efficiency in converting participation into points. A player who earns many points with few interactions is more valuable.

### 2. messages_length
**Metric**: Total sum of message length per player
**File**: `level_b_messages.csv` (column `text_length`)
**Description**: Sorts players by their total communication activity. Players who write longer messages are considered more active.

### 3. points_spent
**Metric**: Total sum of points spent per player
**File**: `level_b_spend.csv` (column `points_spent`)
**Description**: Sorts players by their total investment in the platform. Players who spend more points show greater commitment.

## Approach and Tradeoffs

**Main approach**: I use a "snake draft" algorithm that assigns players sorted by the selected metric alternately to teams. This ensures that teams are balanced both in size and capability.

**Tradeoffs made**:
- **Simplicity vs Complexity**: I chose a simple deterministic algorithm instead of complex optimization to keep the code readable and maintainable.
- **Balance vs Speed**: The current algorithm prioritizes size balance over perfect performance balance optimization, but it's much faster to execute.
- **Functional vs OOP**: I used functional programming as requested, which makes the code more predictable and easier to test.
- **Flexibility vs Specialization**: I added multiple sort types for greater flexibility while maintaining the simplicity of the base algorithm.

## Modeling Choice

**Performance metrics**: Each sort type uses a specific metric that captures different aspects of player behavior:
- **events_performance**: Efficiency in converting participation into points
- **messages_length**: Communication activity and engagement
- **points_spent**: Financial commitment to the platform

## Tie-break Rule

In case of a tie in the selected metric, the player with the **lowest player_id** (ascending) is chosen first. This ensures that the result is deterministic and reproducible. The system is completely deterministic, so the same input always produces the same output.

- **Tie-break**: "metric desc → player_id asc."
- **Repeatability**: "Same input + flags → identical output (no random defaults)."

## Assumptions

- CSV data is clean and contains no null or invalid values
- `historical_event_engagements` can be 0, in which case the average is set to 0
- Teams are numbered starting from 1 (not from 0)
- CSV files are located in `../data/` relative to the script directory
- If no sort type is specified, `events_performance` is used as default

## If I had more time, I would add...

1. **Data validation**: CSV integrity verification and handling of missing values
2. **Multiple balance algorithms**: I would implement different strategies (round-robin, greedy, etc.) and allow the user to choose
3. **Additional metrics**: I would consider other factors such as active days, current streak, etc.
4. **Simple web interface**: A web page to visualize teams and their statistics
5. **Unit tests**: Complete test coverage for all functions
6. **Result export**: Save assignments in CSV or JSON
7. **Balance analysis**: More detailed statistics on how balanced the teams are

## AI Usage

**Yes, I used AI** for this project. AI helped me with:
- Initial TypeScript code structure and functional programming approach
- Command line argument parsing logic
- Assignment algorithm optimization and snake draft implementation
- Multiple sort types implementation
- CSV processing and data aggregation

## Time invested

**01:45** - Including requirements analysis, implementation, testing, debugging, and documentation.
**00:17** - Changes made to fit the functionality requests.

## Files Generated

The application outputs results to **stdout** (console). No files are written to disk.

## Project Structure

```
Back/
├── SortPlayers.ts      # Main assignment logic
├── package.json        # Dependencies and scripts
├── README.md          # This documentation
├── FIXES.md           # Corrections made to AI-generated code
└── prompts/           # AI prompts used
    ├── prompt1.txt    # Initial requirements and TypeScript setup
    ├── prompt2.txt    # Snake draft algorithm correction
    ├── prompt3.txt    # Output format improvements
    └── prompt4.txt    # Multiple sort types implementation
```

## Key Corrections to AI Output

See `FIXES.md` for detailed corrections made to AI-generated code, including:
- Snake draft algorithm implementation for proper team balancing
- Formula correction for events_performance calculation
- CSV processing optimization to only load necessary columns
- Multiple sort types implementation with Level B data
- Compilation removal for direct ts-node execution

All prompts used with AI are in English and stored in the `prompts/` folder.

## Additional User-Facing Stat

**Performance Range**: Shows the spread between the best and worst performing players in each team (min-max values).

**Why**: This metric helps users understand team diversity and explains why average team performance can vary significantly despite balanced assignment, making the distribution more transparent and trustworthy to the community.

## Example Output

### events_performance
```
Starting player assignment to 3 teams using events_performance sort...

=== PLAYER ASSIGNMENTS ===
player_id -> new_team (average points/event) [events_participated, total_points]
------------------------------------------------------------------------------
14 -> Team 1 (912.20) [1, 4561]
25 -> Team 2 (856.33) [3, 2569]
36 -> Team 3 (789.45) [2, 1579]
...

=== TEAM SUMMARY ===
Team 1:
  Size: 67 players
  Average points per event: 245.67
  Performance Range: 45-1250 points/event (min-max)
  Total historical points: 125,890
  Players: [14, 8, 12, ...]
  Justification: This team has 67 players with an average of 245.67 points per event, indicating a balanced level of commitment.
```

### messages_length
```
Starting player assignment to 3 teams using messages_length sort...

=== PLAYER ASSIGNMENTS ===
player_id -> new_team (total message length) [events_participated, total_points]
------------------------------------------------------------------------------
83 -> Team 1 (1250) [5, 2340]
175 -> Team 2 (1180) [3, 1890]
62 -> Team 3 (1120) [4, 2100]
...
```

### points_spent
```
Starting player assignment to 3 teams using points_spent sort...

=== PLAYER ASSIGNMENTS ===
player_id -> new_team (total points spent) [events_participated, total_points]
------------------------------------------------------------------------------
35 -> Team 1 (1250) [2, 890]
69 -> Team 2 (1180) [4, 1560]
16 -> Team 3 (1120) [1, 450]
...
```
