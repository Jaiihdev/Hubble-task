# Hubble Task

A grid-based task timer application that allows users to create and manage countdown timers with a visual whiteboard interface.

## Features

- 📋 **Grid Canvas**: Pin tasks anywhere on a whiteboard-like grid
- ⏱️ **Countdown Timer**: Set time for each task and get alerted when it reaches zero
- 🔔 **Audio Notifications**: Plays a sound when a timer completes
- 🎨 **Visual Organization**: Color-coded tasks with drag-and-drop positioning
- 💾 **Persistence**: All tasks and their positions are saved in localStorage

## How to Use

1. **Create a Task**:
   - Enter a task name in the input field
   - Set the timer duration in minutes (default: 25 minutes)
   - Click "Add to Grid" to place the task on the whiteboard

2. **Manage Tasks on the Grid**:
   - Drag tasks anywhere on the grid to organize them visually
   - Tasks snap to a grid for easy alignment
   - Each task gets a random color for visual distinction

3. **Control Timers**:
   - Click the play/pause button to start/pause the timer
   - When a timer completes, an audio alert will play
   - Complete a task by clicking the X button

4. **View Completed Tasks**:
   - Completed tasks appear in the sidebar history
   - History shows task name and time used
   - Click "Clear History" to remove all completed tasks

## Technical Details

- Built with vanilla HTML, CSS, and JavaScript
- Uses Bootstrap 5 for styling (loaded via CDN)
- Implements drag-and-drop without external dependencies
- All task data is stored in the browser's localStorage

## Running Locally

No installation required! Simply clone or download this repository and open `index.html` in any modern web browser.

```
git clone https://github.com/Jaiihdev/Hubble-task.git
cd hubble-task
```

Then open `index.html` in your browser.

## License

MIT 
