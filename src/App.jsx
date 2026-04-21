import { useEffect, useEffectEvent, useMemo, useRef, useState, startTransition } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { v4 as uuidv4 } from 'uuid';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Crosshair,
  Gauge,
  Image as ImageIcon,
  MapPinned,
  Plus,
  Radar,
  ShieldAlert,
  Sparkles,
  Trash2,
  Trophy,
  Waves,
  Wifi,
  WifiOff,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

const STORAGE_TASKS_KEY = 'campus-os-v3-tasks';
const STORAGE_BG_KEY = 'campus-os-v3-background';
const STORAGE_ROLE_KEY = 'campus-os-v3-role';
const STORAGE_CALIBRATION_KEY = 'campus-os-v3-calibration';
const STORAGE_LOCALE_KEY = 'campus-os-v3-locale';
const STORAGE_CAPTURE_LOGS_KEY = 'campus-os-v3-capture-logs';
const STORAGE_APP_READY_KEY = 'campus-os-v3-app-ready';
const DEFAULT_USER_POSITION = { x: 48, y: 54 };
const CLUSTER_SCALE_THRESHOLD = 1.4;
const LONG_PRESS_MS = 420;

const COPY = {
  zh: {
    appTitle: 'Campus OS',
    heroTitle: '\u5148\u628a\u771f\u5b9e\u4e16\u754c\u7ed1\u5b9a\u5230\u624b\u7ed8\u5730\u56fe',
    heroDesc: '\u5148\u4e0a\u4f20\u624b\u7ed8\u6821\u56ed\u5e95\u56fe\uff0c\u518d\u901a\u8fc7 3 \u4e2a\u4ee5\u4e0a\u951a\u70b9\u628a\u771f\u5b9e\u5750\u6807\u6620\u5c04\u5230\u56fe\u7247\uff0c\u84dd\u70b9\u548c\u4efb\u52a1\u624d\u80fd\u771f\u6b63\u951a\u5b9a\u3002',
    uploadBaseMap: '\u4e0a\u4f20\u5e95\u56fe',
    switchToAdmin: '\u5207\u6362\u7ba1\u7406\u7aef',
    admin: '\u7ba1\u7406\u7aef',
    student: '\u5b66\u751f\u7aef',
    calibrateFirst: '\u5148\u505a\u5730\u56fe\u914d\u51c6',
    live: '\u8fdb\u884c\u4e2d',
    weakSignal: 'GPS \u8f83\u5f31',
    stableLock: '\u5b9a\u4f4d\u7a33\u5b9a',
    offlineGuard: '\u79bb\u7ebf\u4fdd\u62a4',
    online: '\u5728\u7ebf',
    networkHealthy: '\u6821\u56ed\u7f51\u7edc\u7a33\u5b9a',
    networkLost: '\u7f51\u7edc\u8ff7\u8def\u4e86\uff0c\u6211\u4eec\u6b63\u5728\u5c1d\u8bd5\u547c\u5524\u5b83\u3002',
    noBaseMap: '\u8fd8\u6ca1\u6709\u5e95\u56fe\uff0c\u8bf7\u5148\u4e0a\u4f20\u624b\u7ed8\u5730\u56fe\u3002',
    placeTaskTip: '\u8bf7\u5728\u5730\u56fe\u4e0a\u70b9\u4e00\u4e0b\uff0c\u653e\u7f6e\u65b0\u4efb\u52a1\u3002',
    placeAnchorTip: '\u8bf7\u70b9\u51fb\u4e00\u4e2a\u56fa\u5b9a\u5730\u6807\uff0c\u6dfb\u52a0\u6821\u51c6\u951a\u70b9\u3002',
    completed: '\u5df2\u5b8c\u6210',
    expired: '\u5df2\u8fc7\u671f',
    anchors: '\u951a\u70b9\u6570',
    livePosition: '\u5b9e\u65f6\u5b9a\u4f4d',
    realToMap: '\u771f\u5b9e\u5750\u6807\u5230\u5730\u56fe\u50cf\u7d20',
    tracking: '\u5b9e\u65f6\u8ffd\u8e2a',
    useGps: '\u542f\u7528 GPS',
    worldX: '\u771f\u5b9e X / \u7ecf\u5ea6',
    worldY: '\u771f\u5b9e Y / \u7eac\u5ea6',
    headingPreview: '\u671d\u5411\u9884\u89c8',
    mappedX: '\u6620\u5c04 X',
    mappedY: '\u6620\u5c04 Y',
    transform: '\u53d8\u6362\u72b6\u6001',
    ready: '\u5df2\u6c42\u89e3',
    need3Anchors: '\u81f3\u5c11 3 \u4e2a\u951a\u70b9',
    addTask: '\u6dfb\u52a0\u4efb\u52a1',
    calibrateMap: '\u6821\u51c6\u5730\u56fe',
    replaceBaseMap: '\u66ff\u6362\u5e95\u56fe',
    heatmap: '\u70ed\u529b\u56fe',
    clearMap: '\u6e05\u7a7a\u5e95\u56fe',
    dockHint: '\u5148\u6dfb\u52a0 3 \u5230 6 \u4e2a\u7a33\u5b9a\u951a\u70b9\uff0c\u518d\u8ba9\u84dd\u70b9\u6309\u771f\u5b9e\u5750\u6807\u81ea\u52a8\u843d\u5230\u624b\u7ed8\u5730\u56fe\u4e0a\u3002',
    mapCalibration: '\u5730\u56fe\u914d\u51c6',
    anchorPairs: '\u951a\u70b9\u5bf9\u7167\u4e0e\u4eff\u5c04\u53d8\u6362',
    resetAnchors: '\u91cd\u7f6e\u951a\u70b9',
    finishTargets: '\u76ee\u6807\u70b9\u5df2\u653e\u5b8c',
    addMoreTargets: '\u7ee7\u7eed\u70b9\u5730\u56fe\u653e\u951a\u70b9',
    exportCalibration: '\u5bfc\u51fa\u5b9a\u4f4d\u6587\u4ef6',
    targetsPlanned: '\u5df2\u89c4\u5212\u76ee\u6807',
    singleMode: '\u5355\u70b9\u6a21\u5f0f',
    batchMode: '\u6279\u91cf\u6a21\u5f0f',
    directionReady: '\u671d\u5411\u5df2\u81ea\u52a8\u5bf9\u9f50',
    directionWaiting: '\u5b8c\u6210\u524d\u4e24\u4e2a\u951a\u70b9\u540e\u81ea\u52a8\u5bf9\u9f50\u671d\u5411',
    headingOffset: '\u5730\u56fe\u671d\u5411',
    currentStep: '\u5f53\u524d\u8fdb\u5ea6',
    targetProgress: '\u5f53\u524d\u76ee\u6807',
    calibrated: '\u5df2\u6821\u51c6',
    fitError: '\u62df\u5408\u8bef\u5dee',
    status: '\u72b6\u6001',
    solved: '\u5df2\u62df\u5408',
    collectMore: '\u7ee7\u7eed\u91c7\u96c6',
    noAnchors: '\u8fd8\u6ca1\u6709\u951a\u70b9\u3002\u8fdb\u5165\u6821\u51c6\u6a21\u5f0f\u540e\u70b9\u51fb\u5730\u56fe\u6dfb\u52a0\u3002',
    remove: '\u5220\u9664',
    rapidPublish: '\u5feb\u901f\u53d1\u5e03',
    plantTask: '\u628a\u4efb\u52a1\u9489\u5728\u5730\u56fe\u4e0a',
    title: '\u6807\u9898',
    description: '\u63cf\u8ff0',
    deadline: '\u622a\u6b62\u65f6\u95f4',
    cancel: '\u53d6\u6d88',
    publishToMap: '\u53d1\u5e03\u5230\u5730\u56fe',
    calibrationAnchor: '\u6821\u51c6\u951a\u70b9',
    bindCoordinate: '\u628a\u771f\u5b9e\u5750\u6807\u7ed1\u5b9a\u5230\u5730\u56fe',
    calibrationFlow: '\u5148\u70b9\u5730\u56fe\uff0c\u518d\u8d70\u5230\u73b0\u573a',
    calibrationHint: '\u70b9\u51fb\u5730\u56fe\u9009\u62e9\u4e0b\u4e00\u4e2a\u951a\u70b9\u76ee\u6807\uff0c\u7136\u540e\u62ff\u7740\u624b\u673a\u8d70\u5230\u90a3\u4e2a\u4f4d\u7f6e\uff0c\u7b49\u5b9a\u4f4d\u7a33\u5b9a\u540e\u6355\u83b7\u5f53\u524d\u771f\u5b9e\u5750\u6807\u3002',
    calibrationSteps: '1 \u70b9\u5730\u56fe  2 \u8d70\u5230\u73b0\u573a  3 \u6355\u83b7',
    currentTarget: '\u5f53\u524d\u76ee\u6807\u951a\u70b9',
    chooseTarget: '\u8bf7\u9009\u62e9\u5730\u56fe\u76ee\u6807\u70b9',
    captureCurrent: '\u6355\u83b7\u5f53\u524d\u4f4d\u7f6e',
    dragBlueDot: '\u62d6\u52a8\u84dd\u70b9\u505a\u4eba\u5de5\u4fee\u6b63',
    targetSelected: '\u5df2\u9009\u62e9\u76ee\u6807\u70b9',
    selectedTarget: '\u5df2\u9009\u76ee\u6807',
    nextAnchorName: '\u4e0b\u4e00\u4e2a\u951a\u70b9',
    probeHint: '\u5982\u679c\u84dd\u70b9\u504f\u4e86\uff0c\u76f4\u63a5\u62d6\u5230\u811a\u4e0b',
    doneAnchor: '\u5df2\u5b8c\u6210\u951a\u70b9',
    anchorLabel: '\u951a\u70b9\u540d\u79f0',
    mapPoint: '\u5730\u56fe\u5750\u6807',
    saveAnchor: '\u4fdd\u5b58\u951a\u70b9',
    organizer: '\u53d1\u5e03\u8005',
    starts: '\u5f00\u59cb\u65f6\u95f4',
    waiting: '\u7b49\u5f85\u4e2d',
    active: '\u8fdb\u884c\u4e2d',
    swipeDown: '\u4e0b\u6ed1\u5173\u95ed',
    deleteTask: '\u5220\u9664\u4efb\u52a1',
    acceptTask: '\u63a5\u53d7\u4efb\u52a1',
    restoreActive: '\u6062\u590d\u8fdb\u884c\u4e2d',
    useBilingual: '\u4e2d / EN',
    stackMore: '\u66f4\u591a\u4efb\u52a1',
    captureTab: '\u91c7\u96c6',
    calibrateTab: '\u914d\u51c6',
    taskTab: '\u4efb\u52a1',
    installApp: '\u5b89\u88c5\u5230\u624b\u673a',
    captureHistory: '\u672c\u5730\u8bb0\u5f55',
    firstRunTitle: '\u624b\u673a\u91c7\u96c6\u6a21\u5f0f',
    firstRunDesc: '\u5148\u4e0a\u4f20\u5730\u56fe\uff0c\u653e\u951a\u70b9\uff0c\u518d\u8d70\u5230\u73b0\u573a\u6355\u83b7\u3002\u5168\u90e8\u64cd\u4f5c\u90fd\u53ef\u4ee5\u5728\u624b\u673a\u4e0a\u5b8c\u6210\u3002',
    startNow: '\u5f00\u59cb\u4f7f\u7528',
  },
  en: {
    appTitle: 'Campus OS',
    heroTitle: 'Bind the real world to the drawing first',
    heroDesc: 'Upload a hand-drawn campus map, then use at least three anchors to map real coordinates into the image.',
    uploadBaseMap: 'Upload base map',
    switchToAdmin: 'Switch to admin',
    admin: 'Admin',
    student: 'Student',
    calibrateFirst: 'Calibration before navigation',
    live: 'live',
    weakSignal: 'Weak signal',
    stableLock: 'Stable lock',
    offlineGuard: 'Offline guard',
    online: 'Online',
    networkHealthy: 'Campus network is healthy',
    networkLost: 'The network is drifting. We are trying to bring it back.',
    noBaseMap: 'No base map yet. Upload the hand-drawn map first.',
    placeTaskTip: 'Tap the map to place the new task.',
    placeAnchorTip: 'Tap a fixed landmark to add a calibration anchor.',
    completed: 'Completed',
    expired: 'Expired',
    anchors: 'Anchors',
    livePosition: 'Live Position',
    realToMap: 'Real coordinates to map pixels',
    tracking: 'Tracking',
    useGps: 'Use GPS',
    worldX: 'World X / Lng',
    worldY: 'World Y / Lat',
    headingPreview: 'Heading preview',
    mappedX: 'Mapped X',
    mappedY: 'Mapped Y',
    transform: 'Transform',
    ready: 'Ready',
    need3Anchors: 'Need 3 anchors',
    addTask: 'Add task',
    calibrateMap: 'Calibrate map',
    replaceBaseMap: 'Replace base map',
    heatmap: 'Heatmap',
    clearMap: 'Clear map',
    dockHint: 'Add 3 to 6 stable anchors first. Then the blue dot will be computed from real coordinates.',
    mapCalibration: 'Map Calibration',
    anchorPairs: 'Anchor pairs and affine transform',
    resetAnchors: 'Reset anchors',
    finishTargets: 'Targets ready',
    addMoreTargets: 'Keep placing targets',
    exportCalibration: 'Export calibration file',
    targetsPlanned: 'Planned targets',
    singleMode: 'Single',
    batchMode: 'Batch',
    directionReady: 'Direction aligned',
    directionWaiting: 'Direction auto-aligns after the first 2 anchors',
    headingOffset: 'Map heading',
    currentStep: 'Current step',
    targetProgress: 'Current target',
    calibrated: 'Aligned',
    fitError: 'Fit error',
    status: 'Status',
    solved: 'Solved',
    collectMore: 'Collect more',
    noAnchors: 'No anchors yet. Start calibration and tap the map.',
    remove: 'Remove',
    rapidPublish: 'Rapid Publish',
    plantTask: 'Plant a task directly on the map',
    title: 'Title',
    description: 'Description',
    deadline: 'Deadline',
    cancel: 'Cancel',
    publishToMap: 'Publish to map',
    calibrationAnchor: 'Calibration Anchor',
    bindCoordinate: 'Bind a real coordinate to the map',
    calibrationFlow: 'Pick target, then walk there',
    calibrationHint: 'Tap the map to choose the next anchor target, walk to that place with the phone, then capture the current world coordinates.',
    calibrationSteps: '1 Pick target  2 Walk there  3 Capture',
    currentTarget: 'Current target anchor',
    chooseTarget: 'Choose a map target',
    captureCurrent: 'Capture current position',
    dragBlueDot: 'Drag the blue dot for manual correction',
    targetSelected: 'Target selected',
    selectedTarget: 'Selected target',
    nextAnchorName: 'Next anchor',
    probeHint: 'If the blue dot drifts, drag it under your feet',
    doneAnchor: 'Done anchors',
    anchorLabel: 'Anchor label',
    mapPoint: 'Map point',
    saveAnchor: 'Save anchor',
    organizer: 'Organizer',
    starts: 'Starts',
    waiting: 'Waiting',
    active: 'Active',
    swipeDown: 'Swipe down to close',
    deleteTask: 'Delete task',
    acceptTask: 'Accept task',
    restoreActive: 'Restore active',
    useBilingual: '\u4e2d / EN',
    stackMore: 'more tasks',
    captureTab: 'Capture',
    calibrateTab: 'Calibrate',
    taskTab: 'Tasks',
    installApp: 'Install app',
    captureHistory: 'Local history',
    firstRunTitle: 'Mobile capture mode',
    firstRunDesc: 'Upload the map, place anchors, then walk on site and capture points. The whole flow is now mobile-first.',
    startNow: 'Start now',
  },
};

const TASK_TYPES = [
  { id: 'study', label: { zh: '\u5b66\u4e60', en: 'Study' }, icon: BookOpen, accent: 'var(--accent-blue)' },
  { id: 'club', label: { zh: '\u793e\u56e2', en: 'Club' }, icon: Activity, accent: 'var(--accent-cyan)' },
  { id: 'daily', label: { zh: '\u65e5\u5e38', en: 'Daily' }, icon: CalendarClock, accent: 'var(--accent-mint)' },
  { id: 'event', label: { zh: '\u6d3b\u52a8', en: 'Event' }, icon: Trophy, accent: 'var(--accent-yellow)' },
  { id: 'alert', label: { zh: '\u63d0\u9192', en: 'Alert' }, icon: AlertTriangle, accent: 'var(--accent-coral)' },
  { id: 'explore', label: { zh: '\u63a2\u7d22', en: 'Explore' }, icon: Sparkles, accent: 'var(--accent-blue)' },
];

const DEMO_TASKS = [];

function getLocaleLabel(label, locale) {
  if (typeof label === 'string') return label;
  return label?.[locale] || label?.en || '';
}

function solve3x3(matrix, vector) {
  const rows = matrix.map((row, index) => [...row, vector[index]]);

  for (let pivot = 0; pivot < 3; pivot += 1) {
    let maxRow = pivot;
    for (let row = pivot + 1; row < 3; row += 1) {
      if (Math.abs(rows[row][pivot]) > Math.abs(rows[maxRow][pivot])) {
        maxRow = row;
      }
    }

    if (Math.abs(rows[maxRow][pivot]) < 1e-10) return null;
    [rows[pivot], rows[maxRow]] = [rows[maxRow], rows[pivot]];

    const pivotValue = rows[pivot][pivot];
    for (let col = pivot; col < 4; col += 1) {
      rows[pivot][col] /= pivotValue;
    }

    for (let row = 0; row < 3; row += 1) {
      if (row === pivot) continue;
      const factor = rows[row][pivot];
      for (let col = pivot; col < 4; col += 1) {
        rows[row][col] -= factor * rows[pivot][col];
      }
    }
  }

  return [rows[0][3], rows[1][3], rows[2][3]];
}

function computeAffineTransform(anchors) {
  if (anchors.length < 3) return null;

  const ata = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const atbx = [0, 0, 0];
  const atby = [0, 0, 0];

  anchors.forEach((anchor) => {
    const row = [Number(anchor.worldX), Number(anchor.worldY), 1];
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        ata[i][j] += row[i] * row[j];
      }
      atbx[i] += row[i] * Number(anchor.mapX);
      atby[i] += row[i] * Number(anchor.mapY);
    }
  });

  const xParams = solve3x3(ata, atbx);
  const yParams = solve3x3(ata, atby);
  if (!xParams || !yParams) return null;

  return {
    ax: xParams[0],
    bx: xParams[1],
    cx: xParams[2],
    ay: yParams[0],
    by: yParams[1],
    cy: yParams[2],
  };
}

function applyAffineTransform(transform, worldX, worldY) {
  if (!transform) return null;
  return {
    x: transform.ax * worldX + transform.bx * worldY + transform.cx,
    y: transform.ay * worldX + transform.by * worldY + transform.cy,
  };
}

function evaluateCalibration(anchors, transform) {
  if (!transform || anchors.length === 0) return null;

  const errorSum = anchors.reduce((sum, anchor) => {
    const predicted = applyAffineTransform(transform, Number(anchor.worldX), Number(anchor.worldY));
    const dx = predicted.x - Number(anchor.mapX);
    const dy = predicted.y - Number(anchor.mapY);
    return sum + dx * dx + dy * dy;
  }, 0);

  return {
    rms: Math.sqrt(errorSum / anchors.length),
  };
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function getBearingFromPoints(startX, startY, endX, endY) {
  const dx = endX - startX;
  const dy = endY - startY;
  return normalizeDegrees((Math.atan2(dx, -dy) * 180) / Math.PI);
}

function computeHeadingOffset(anchors) {
  if (anchors.length < 2) return null;
  const start = anchors[0];
  const end = anchors[1];
  const worldBearing = getBearingFromPoints(start.worldX, start.worldY, end.worldX, end.worldY);
  const mapBearing = getBearingFromPoints(start.mapX, start.mapY, end.mapX, end.mapY);
  return normalizeDegrees(mapBearing - worldBearing);
}

function buildClusters(tasks, scale) {
  if (scale >= CLUSTER_SCALE_THRESHOLD) {
    const grid = new globalThis.Map();
    const cellSize = 4.2;

    tasks.forEach((task) => {
      const gx = Math.floor(task.x / cellSize);
      const gy = Math.floor(task.y / cellSize);
      const key = `${gx}-${gy}`;
      const current = grid.get(key) || [];
      current.push(task);
      grid.set(key, current);
    });

    return Array.from(grid.entries()).map(([key, group]) => {
      const center = group.reduce(
        (acc, task) => ({ x: acc.x + task.x, y: acc.y + task.y }),
        { x: 0, y: 0 },
      );
      const x = center.x / group.length;
      const y = center.y / group.length;

      if (group.length === 1) {
        const task = group[0];
        return { kind: 'task', x, y, task, id: task.id };
      }

      return {
        kind: 'stack',
        id: key,
        x,
        y,
        tasks: group,
      };
    });
  }

  const grid = new globalThis.Map();
  const cellSize = Math.max(12, 18 - scale * 4);

  tasks.forEach((task) => {
    const gx = Math.floor(task.x / cellSize);
    const gy = Math.floor(task.y / cellSize);
    const key = `${gx}-${gy}`;
    const current = grid.get(key) || [];
    current.push(task);
    grid.set(key, current);
  });

  return Array.from(grid.entries()).map(([key, group]) => {
    if (group.length === 1) {
      const task = group[0];
      return { kind: 'task', x: task.x, y: task.y, task, id: task.id };
    }

    const center = group.reduce(
      (acc, task) => ({ x: acc.x + task.x, y: acc.y + task.y }),
      { x: 0, y: 0 },
    );

    return {
      kind: 'cluster',
      id: key,
      x: center.x / group.length,
      y: center.y / group.length,
      tasks: group,
    };
  });
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [bgImage, setBgImage] = useState(null);
  const [role, setRole] = useState('user');
  const [locale, setLocale] = useState('zh');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isPlacingTask, setIsPlacingTask] = useState(false);
  const [isCalibratingMap, setIsCalibratingMap] = useState(false);
  const [mobileTab, setMobileTab] = useState('capture');
  const [calibrationMode, setCalibrationMode] = useState('single');
  const [tempCoordinate, setTempCoordinate] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskType, setTaskType] = useState('study');
  const [endTime, setEndTime] = useState('');
  const [anchorLabel, setAnchorLabel] = useState('');
  const [captureLogs, setCaptureLogs] = useState([]);
  const [liveWorldX, setLiveWorldX] = useState('121.5060');
  const [liveWorldY, setLiveWorldY] = useState('31.3015');
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [headingInput, setHeadingInput] = useState(18);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [gpsWeak, setGpsWeak] = useState(true);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [isMapInteracting, setIsMapInteracting] = useState(false);
  const [isDraggingProbe, setIsDraggingProbe] = useState(false);
  const [mapScale, setMapScale] = useState(1);
  const [deviceHeading, setDeviceHeading] = useState(18);
  const [manualUserMapPosition, setManualUserMapPosition] = useState(DEFAULT_USER_POSITION);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showMobileIntro, setShowMobileIntro] = useState(() => !localStorage.getItem(STORAGE_APP_READY_KEY));
  const [mapCalibration, setMapCalibration] = useState({
    targets: [],
    targetsLocked: false,
    anchors: [],
    transform: null,
    quality: null,
    headingOffset: null,
  });

  const fileInputRef = useRef(null);
  const longPressTimer = useRef(null);
  const longPressMoved = useRef(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_TASKS_KEY);
    const savedBg = localStorage.getItem(STORAGE_BG_KEY);
    const savedRole = localStorage.getItem(STORAGE_ROLE_KEY);
    const savedCalibration = localStorage.getItem(STORAGE_CALIBRATION_KEY);
    const savedLocale = localStorage.getItem(STORAGE_LOCALE_KEY);
    const savedCaptureLogs = localStorage.getItem(STORAGE_CAPTURE_LOGS_KEY);

    setTasks(savedTasks ? JSON.parse(savedTasks) : DEMO_TASKS);
    if (savedBg) setBgImage(savedBg);
    if (savedRole) setRole(savedRole);
    if (savedCaptureLogs) setCaptureLogs(JSON.parse(savedCaptureLogs));
    if (savedCalibration) {
      const parsed = JSON.parse(savedCalibration);
      setMapCalibration({
        targets: parsed.targets || [],
        targetsLocked: parsed.targetsLocked || false,
        anchors: parsed.anchors || [],
        transform: parsed.transform || null,
        quality: parsed.quality || null,
        headingOffset: typeof parsed.headingOffset === 'number' ? parsed.headingOffset : null,
      });
    }
    if (savedLocale) setLocale(savedLocale);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ROLE_KEY, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LOCALE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CALIBRATION_KEY, JSON.stringify(mapCalibration));
  }, [mapCalibration]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CAPTURE_LOGS_KEY, JSON.stringify(captureLogs));
  }, [captureLogs]);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const smoothHeadingUpdate = useEffectEvent((targetHeading) => {
    setDeviceHeading((current) => {
      const diff = ((((targetHeading - current) % 360) + 540) % 360) - 180;
      return current + diff * 0.16;
    });
  });

  useEffect(() => {
    smoothHeadingUpdate(headingInput);
  }, [headingInput, smoothHeadingUpdate]);

  useEffect(() => {
    const handleOrientation = (event) => {
      if (typeof event.alpha !== 'number') return;
      smoothHeadingUpdate(360 - event.alpha);
    };

    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [smoothHeadingUpdate]);

  useEffect(() => {
    if (!trackingEnabled || !navigator.geolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLiveWorldX(position.coords.longitude.toFixed(6));
        setLiveWorldY(position.coords.latitude.toFixed(6));
        setGpsWeak(position.coords.accuracy > 30);
      },
      () => {
        setTrackingEnabled(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 8000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [trackingEnabled]);

  useEffect(() => {
    const cancelInteraction = () => {
      setIsMapInteracting(false);
      setIsDraggingProbe(false);
    };
    window.addEventListener('pointerup', cancelInteraction);
    return () => window.removeEventListener('pointerup', cancelInteraction);
  }, []);

  const pendingTasks = tasks.filter((task) => task.status !== 'completed');
  const completedCount = tasks.filter((task) => task.status === 'completed').length;
  const expiredCount = tasks.filter((task) => task.endTime && new Date(task.endTime) < new Date()).length;
  const renderedNodes = useMemo(() => buildClusters(tasks, mapScale), [tasks, mapScale]);

  const liveWorldPosition = useMemo(() => {
    const worldX = Number(liveWorldX);
    const worldY = Number(liveWorldY);
    if (!Number.isFinite(worldX) || !Number.isFinite(worldY)) return null;
    return { worldX, worldY };
  }, [liveWorldX, liveWorldY]);

  const mappedUserPosition = useMemo(() => {
    if (!liveWorldPosition || !mapCalibration.transform) return manualUserMapPosition;
    const mapped = applyAffineTransform(mapCalibration.transform, liveWorldPosition.worldX, liveWorldPosition.worldY);
    if (!mapped) return manualUserMapPosition;
    return {
      x: clampPercent(mapped.x),
      y: clampPercent(mapped.y),
    };
  }, [liveWorldPosition, mapCalibration.transform, manualUserMapPosition]);

  const t = COPY[locale];
  const activeTaskLabel = `${pendingTasks.length} ${t.live}`;
  const gpsLabel = gpsWeak ? t.weakSignal : t.stableLock;
  const networkLabel = isOffline ? t.networkLost : t.networkHealthy;
  const calibrationReady = mapCalibration.anchors.length >= 3 && Boolean(mapCalibration.transform);
  const currentTargetIndex = mapCalibration.anchors.length;
  const activePlannedTarget = mapCalibration.targetsLocked ? mapCalibration.targets[currentTargetIndex] || null : null;
  const previewTargets = mapCalibration.targetsLocked ? mapCalibration.targets.slice(currentTargetIndex) : mapCalibration.targets;
  const effectiveHeading = normalizeDegrees(deviceHeading + (mapCalibration.headingOffset || 0));

  const beginLongPress = (event) => {
    if (role !== 'uploader' || !bgImage || showTaskForm || isPlacingTask || isCalibratingMap) {
      return;
    }

    longPressMoved.current = false;
    longPressTimer.current = window.setTimeout(() => {
      if (longPressMoved.current) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      setTempCoordinate({ x, y });
      setShowTaskForm(true);
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMapPointerMove = () => {
    longPressMoved.current = true;
    cancelLongPress();
  };

  const updateProbeFromPointer = (event) => {
    const stage = event.currentTarget.closest('.map-stage');
    if (!stage) return;
    const bounds = stage.getBoundingClientRect();
    const x = clampPercent(((event.clientX - bounds.left) / bounds.width) * 100);
    const y = clampPercent(((event.clientY - bounds.top) / bounds.height) * 100);
    setManualUserMapPosition({ x, y });
  };

  const handleProbePointerDown = (event) => {
    if (!isCalibratingMap) return;
    event.stopPropagation();
    event.preventDefault();
    setIsDraggingProbe(true);
    updateProbeFromPointer(event);
  };

  const handleProbePointerMove = (event) => {
    if (!isDraggingProbe) return;
    event.stopPropagation();
    updateProbeFromPointer(event);
  };

  const handleProbePointerUp = (event) => {
    if (!isDraggingProbe) return;
    event.stopPropagation();
    setIsDraggingProbe(false);
  };

  const handleMapClick = (event) => {
    if (!bgImage) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    if (isCalibratingMap && role === 'uploader') {
      if (mapCalibration.targetsLocked && calibrationMode === 'batch') return;

      if (calibrationMode === 'single') {
        const nextIndex = mapCalibration.anchors.length + 1;
        const singleTarget = {
          id: uuidv4(),
          label: `${locale === 'zh' ? '锚点' : 'Anchor'} ${nextIndex}`,
          mapX: x,
          mapY: y,
        };
        setMapCalibration((current) => ({
          ...current,
          targets: [
            ...current.anchors.map((anchor) => ({
              id: anchor.id,
              label: anchor.label,
              mapX: anchor.mapX,
              mapY: anchor.mapY,
            })),
            singleTarget,
          ],
          targetsLocked: true,
        }));
        setAnchorLabel(singleTarget.label);
        return;
      }

      const nextIndex = mapCalibration.targets.length + 1;
      const nextTarget = {
        id: uuidv4(),
        label: `${locale === 'zh' ? '锚点' : 'Anchor'} ${nextIndex}`,
        mapX: x,
        mapY: y,
      };
      setMapCalibration((current) => ({
        ...current,
        targets: [...current.targets, nextTarget],
      }));
      setAnchorLabel(nextTarget.label);
      return;
    }

    if (isPlacingTask && role === 'uploader') {
      setTempCoordinate({ x, y });
      setShowTaskForm(true);
      setIsPlacingTask(false);
      return;
    }

    startTransition(() => {
      setSelectedTask(null);
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result;
      if (typeof base64 !== 'string') return;
      setBgImage(base64);
      localStorage.setItem(STORAGE_BG_KEY, base64);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskType('study');
    setEndTime('');
    setTempCoordinate(null);
    setShowTaskForm(false);
  };

  const pushCaptureLog = (entry) => {
    setCaptureLogs((current) => [
      {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        ...entry,
      },
      ...current,
    ].slice(0, 12));
  };

  const resetAnchorForm = () => {
    setAnchorLabel('');
  };

  const submitTask = () => {
    if (!taskTitle.trim() || !tempCoordinate) return;

    const newTask = {
      id: uuidv4(),
      x: tempCoordinate.x,
      y: tempCoordinate.y,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      type: taskType,
      organizer: 'Campus Ops',
      status: 'pending',
      countdown: endTime ? `Due ${formatDateTime(endTime)}` : 'Ready to accept',
      createdAt: new Date().toISOString(),
      startTime: new Date().toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : null,
    };

    setTasks((current) => [...current, newTask]);
    pushCaptureLog({
      type: 'task',
      title: newTask.title,
      detail: `${newTask.x.toFixed(1)}%, ${newTask.y.toFixed(1)}%`,
    });
    resetTaskForm();
  };

  const submitAnchor = () => {
    const worldX = Number(liveWorldX);
    const worldY = Number(liveWorldY);
    const fallbackLabel = `${t.anchorLabel} ${mapCalibration.anchors.length + 1}`;
    const finalLabel = anchorLabel.trim() || fallbackLabel;
    if (!activePlannedTarget || !Number.isFinite(worldX) || !Number.isFinite(worldY)) return;

    const anchor = {
      id: activePlannedTarget.id,
      label: finalLabel,
      worldX,
      worldY,
      mapX: activePlannedTarget.mapX,
      mapY: activePlannedTarget.mapY,
    };

    const nextAnchors = [...mapCalibration.anchors, anchor];
    const transform = computeAffineTransform(nextAnchors);
    const quality = evaluateCalibration(nextAnchors, transform);
    const headingOffset = computeHeadingOffset(nextAnchors);

    setMapCalibration((current) => ({
      ...current,
      anchors: nextAnchors,
      transform,
      quality,
      headingOffset,
      targetsLocked: calibrationMode === 'batch' ? current.targetsLocked : false,
    }));

    setGpsWeak(false);
    setManualUserMapPosition({
      x: activePlannedTarget.mapX,
      y: activePlannedTarget.mapY,
    });
    pushCaptureLog({
      type: 'anchor',
      title: finalLabel,
      detail: `${worldX.toFixed(6)}, ${worldY.toFixed(6)}`,
    });
    resetAnchorForm();
  };

  const removeAnchor = (anchorId) => {
    const nextAnchors = mapCalibration.anchors.filter((anchor) => anchor.id !== anchorId);
    const nextTargets = mapCalibration.targets.filter((target) => target.id !== anchorId);
    const transform = computeAffineTransform(nextAnchors);
    const quality = evaluateCalibration(nextAnchors, transform);
    const headingOffset = computeHeadingOffset(nextAnchors);
    setMapCalibration({
      ...mapCalibration,
      targets: nextTargets,
      anchors: nextAnchors,
      transform,
      quality,
      headingOffset,
    });
  };

  const clearCalibration = () => {
    setMapCalibration({
      targets: [],
      targetsLocked: false,
      anchors: [],
      transform: null,
      quality: null,
      headingOffset: null,
    });
    setIsCalibratingMap(false);
    setManualUserMapPosition(DEFAULT_USER_POSITION);
    resetAnchorForm();
  };

  const lockCalibrationTargets = () => {
    if (mapCalibration.targets.length < 3) return;
    setMapCalibration((current) => ({
      ...current,
      targetsLocked: true,
    }));
    setAnchorLabel(mapCalibration.targets[0]?.label || '');
  };

  const exportCalibrationFile = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      locale,
      targets: mapCalibration.targets,
      anchors: mapCalibration.anchors,
      transform: mapCalibration.transform,
      quality: mapCalibration.quality,
      headingOffset: mapCalibration.headingOffset,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'campus-map-calibration.json';
    link.click();
    URL.revokeObjectURL(url);
    pushCaptureLog({
      type: 'export',
      title: 'Calibration file',
      detail: 'campus-map-calibration.json',
    });
  };

  const handleInstallApp = async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    setInstallPromptEvent(null);
  };

  const closeMobileIntro = () => {
    localStorage.setItem(STORAGE_APP_READY_KEY, '1');
    setShowMobileIntro(false);
  };

  const removeTask = (taskId) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  const toggleTaskComplete = (taskId) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
          : task,
      ),
    );

    setSelectedTask((current) =>
      current
        ? {
            ...current,
            status: current.status === 'completed' ? 'pending' : 'completed',
          }
        : current,
    );
  };

  const openTaskFromNode = (task) => {
    startTransition(() => {
      setSelectedTask(task);
    });

    if (navigator.vibrate) navigator.vibrate(18);
  };

  const clearMapImage = () => {
    setBgImage(null);
    localStorage.removeItem(STORAGE_BG_KEY);
    setIsPlacingTask(false);
    setIsCalibratingMap(false);
  };

  return (
    <div className="app-shell">
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />

      <div className={`map-surface ${isMapInteracting ? 'ui-dimmed' : ''}`}>
        <div className="background-glow" />
        <div className="background-noise" />

        {showMobileIntro && (
          <div className="mobile-intro-overlay">
            <div className="mobile-intro-card">
              <span className="eyebrow">{t.appTitle}</span>
              <h2>{t.firstRunTitle}</h2>
              <p>{t.firstRunDesc}</p>
              <button className="primary-pill" onClick={closeMobileIntro}>
                {t.startNow}
              </button>
            </div>
          </div>
        )}

        {bgImage ? (
          <TransformWrapper
            minScale={0.7}
            maxScale={4.4}
            initialScale={1}
            centerOnInit
            limitToBounds
            onPanningStart={() => setIsMapInteracting(true)}
            onPanningStop={() => setIsMapInteracting(false)}
            onZoomStart={() => setIsMapInteracting(true)}
            onZoomStop={() => setIsMapInteracting(false)}
            onTransformed={(ref) => {
              setMapScale(ref.state.scale);
            }}
          >
            {(utils) => (
              <>
                <TransformComponent wrapperClass="map-wrapper" contentClass="map-content">
                  <div
                    className={`map-stage ${isPlacingTask || isCalibratingMap ? 'placement-cursor' : ''}`}
                    onPointerDown={beginLongPress}
                    onPointerMove={handleMapPointerMove}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    onClick={handleMapClick}
                  >
                    <img src={bgImage} alt="Campus map" className="map-image" draggable="false" />
                    <div className="map-overlay-tone" />

                    {heatmapMode && (
                      <div className="heatmap-layer">
                        {pendingTasks.map((task) => (
                          <span
                            key={`heat-${task.id}`}
                            className="heat-bloom"
                            style={{ left: `${task.x}%`, top: `${task.y}%` }}
                          />
                        ))}
                      </div>
                    )}

                    {mapCalibration.anchors.map((anchor) => (
                      <button
                        key={anchor.id}
                        className="anchor-node"
                        style={{ left: `${anchor.mapX}%`, top: `${anchor.mapY}%` }}
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <span className="anchor-pin-head" />
                        <span className="anchor-pin-stem" />
                        <span className="anchor-pin-label">{anchor.label}</span>
                      </button>
                    ))}

                    {previewTargets.map((target, index) => (
                      <div
                        key={target.id}
                        className={`anchor-target-node ${index === 0 && mapCalibration.targetsLocked ? 'active-target' : ''}`}
                        style={{ left: `${target.mapX}%`, top: `${target.mapY}%` }}
                      >
                        <span className="anchor-pin-head target" />
                        <span className="anchor-pin-stem target" />
                        <span className="anchor-pin-label target">
                          {target.label}
                          {index === 0 && mapCalibration.targetsLocked
                            ? ` · ${t.targetProgress} ${currentTargetIndex + 1}/${mapCalibration.targets.length}`
                            : ''}
                        </span>
                      </div>
                    ))}

                    <button
                      type="button"
                      className={`user-location ${gpsWeak ? 'weak' : ''} ${isCalibratingMap ? 'draggable' : ''}`}
                      style={{ left: `${mappedUserPosition.x}%`, top: `${mappedUserPosition.y}%` }}
                      onPointerDown={handleProbePointerDown}
                      onPointerMove={handleProbePointerMove}
                      onPointerUp={handleProbePointerUp}
                    >
                      <span
                        className="user-heading-fan"
                        style={{ transform: `translate(-50%, calc(-100% + 10px)) rotate(${effectiveHeading}deg)` }}
                      />
                      <span className={`user-pulse ${gpsWeak ? 'weak' : ''}`} />
                      <span className="user-dot" />
                      {typeof mapCalibration.headingOffset === 'number' && (
                        <span className="user-calibrated-badge">{t.calibrated}</span>
                      )}
                    </button>

                    <AnimatePresence>
                      {renderedNodes.map((node) => {
                        if (node.kind === 'cluster') {
                          return (
                            <motion.button
                              key={node.id}
                              className="cluster-node"
                              style={{ left: `${node.x}%`, top: `${node.y}%` }}
                              initial={{ scale: 0.7, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.6, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                              onClick={(event) => {
                                event.stopPropagation();
                                utils.zoomIn(0.45);
                              }}
                            >
                              <span>{node.tasks.length}</span>
                            </motion.button>
                          );
                        }

                        if (node.kind === 'stack') {
                          const topTask = node.tasks[0];
                          const topMeta = getTaskTypeMeta(topTask.type);
                          const visibleTasks = node.tasks.slice(0, 3);

                          return (
                            <motion.button
                              key={node.id}
                              className="task-stack-marker"
                              style={{
                                left: `${node.x}%`,
                                top: `${node.y}%`,
                                '--marker-accent': topMeta.accent,
                              }}
                              initial={{ scale: 0.4, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.5, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                              onClick={(event) => {
                                event.stopPropagation();
                                openTaskFromNode(topTask);
                              }}
                            >
                              <span className="stack-stem" />
                              {visibleTasks.map((task, index) => {
                                const meta = getTaskTypeMeta(task.type);
                                return (
                                  <span
                                    key={task.id}
                                    className={`stack-head level-${index + 1}`}
                                    style={{ '--stack-accent': meta.accent }}
                                  >
                                    <meta.icon size={14} strokeWidth={1.8} />
                                  </span>
                                );
                              })}
                              {node.tasks.length > 3 && <span className="stack-count">+{node.tasks.length - 3}</span>}
                              <span className="marker-label">
                                {topTask.title} · {node.tasks.length - 1}+ {t.stackMore}
                              </span>
                            </motion.button>
                          );
                        }

                        const meta = getTaskTypeMeta(node.task.type);
                        const isExpired =
                          node.task.endTime && new Date(node.task.endTime).getTime() < Date.now();

                        return (
                          <motion.button
                            key={node.id}
                            className={`task-marker ${node.task.status} ${isExpired ? 'expired' : ''}`}
                            style={{
                              left: `${node.x}%`,
                              top: `${node.y}%`,
                              '--marker-accent': meta.accent,
                            }}
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 360, damping: 20 }}
                            onClick={(event) => {
                              event.stopPropagation();
                              openTaskFromNode(node.task);
                            }}
                          >
                            <span className="pin-stem" />
                            <span className="marker-core">
                              <meta.icon size={16} strokeWidth={1.8} />
                            </span>
                            <span className="marker-label">{node.task.title}</span>
                          </motion.button>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </TransformComponent>

                <div className="floating-controls">
                  <button className="icon-glass-btn" onClick={() => utils.zoomIn(0.3)} aria-label="Zoom in">
                    <ZoomIn size={18} />
                  </button>
                  <button className="icon-glass-btn" onClick={() => utils.zoomOut(0.3)} aria-label="Zoom out">
                    <ZoomOut size={18} />
                  </button>
                </div>
              </>
            )}
          </TransformWrapper>
        ) : (
          <div className="empty-map">
            <div className="empty-illustration">
              <div className="empty-ripple" />
              <MapPinned size={42} strokeWidth={1.6} />
            </div>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroDesc}</p>
            <div className="empty-actions">
              <button className="primary-pill" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon size={16} />
                {t.uploadBaseMap}
              </button>
              <button className="ghost-pill" onClick={() => setRole('uploader')}>
                <ShieldAlert size={16} />
                {t.switchToAdmin}
              </button>
            </div>
          </div>
        )}

        <div className="hud-layer">
          <div className="hud-top">
            <motion.div
              className="brand-glass"
              animate={{ opacity: isMapInteracting ? 0.32 : 1, y: isMapInteracting ? -12 : 0 }}
              transition={{ duration: 0.22 }}
            >
              <div>
                <span className="eyebrow">{t.appTitle}</span>
                <h2>{t.calibrateFirst}</h2>
              </div>
              <div className="brand-actions">
                <button className="ghost-pill compact" onClick={() => setLocale((current) => (current === 'zh' ? 'en' : 'zh'))}>
                  {t.useBilingual}
                </button>
                <button
                  className="mode-pill"
                  onClick={() => setRole((current) => (current === 'uploader' ? 'user' : 'uploader'))}
                >
                  {role === 'uploader' ? t.admin : t.student}
                </button>
              </div>
            </motion.div>

            <motion.div
              className="top-actions"
              animate={{ opacity: isMapInteracting ? 0.18 : 1, y: isMapInteracting ? -12 : 0 }}
              transition={{ duration: 0.22 }}
            >
              <button className="glass-chip">
                <Radar size={16} />
                {activeTaskLabel}
              </button>
              <button className={`glass-chip ${gpsWeak ? 'warning' : ''}`} onClick={() => setGpsWeak((value) => !value)}>
                <Gauge size={16} />
                {gpsLabel}
              </button>
              <button
                className={`glass-chip ${isOffline ? 'warning' : ''}`}
                onClick={() => setIsOffline((value) => !value)}
              >
                {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
                {isOffline ? t.offlineGuard : t.online}
              </button>
            </motion.div>
          </div>

          {isOffline && <div className="status-banner warning-banner">{networkLabel}</div>}
          {!bgImage && <div className="status-banner">{t.noBaseMap}</div>}
          {isPlacingTask && bgImage && role === 'uploader' && (
            <div className="status-banner placement-banner">{t.placeTaskTip}</div>
          )}
          {isCalibratingMap && bgImage && role === 'uploader' && (
            <div className="status-banner placement-banner">{t.placeAnchorTip}</div>
          )}

          {tasks.length > 0 && !selectedTask && (
            <motion.div
              className="summary-rail"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
            >
              <div className="summary-card">
                <span>{t.completed}</span>
                <strong>{completedCount}</strong>
              </div>
              <div className="summary-card">
                <span>{t.expired}</span>
                <strong>{expiredCount}</strong>
              </div>
              <div className="summary-card">
                <span>{t.anchors}</span>
                <strong>{mapCalibration.anchors.length}</strong>
              </div>
            </motion.div>
          )}

          <motion.div
            className="location-panel simple-location-panel"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="panel-title-row">
              <div>
                <span className="eyebrow">{t.livePosition}</span>
                <h3>{t.realToMap}</h3>
              </div>
              <div className="simple-status-badges">
                <button className={`glass-tool compact ${trackingEnabled ? 'active' : ''}`} onClick={() => setTrackingEnabled((value) => !value)}>
                  <Crosshair size={15} />
                  {trackingEnabled ? t.tracking : t.useGps}
                </button>
                <button className="ghost-pill compact" onClick={() => setHeadingInput((current) => (current + 30) % 360)}>
                  {t.headingPreview}: {Math.round(deviceHeading)} deg
                </button>
              </div>
            </div>

            <div className="simple-location-grid">
              <div className="simple-stat">
                <span>{t.worldX}</span>
                <strong>{liveWorldX}</strong>
              </div>
              <div className="simple-stat">
                <span>{t.worldY}</span>
                <strong>{liveWorldY}</strong>
              </div>
              <div className="simple-stat">
                <span>{t.transform}</span>
                <strong>{calibrationReady ? t.ready : t.need3Anchors}</strong>
              </div>
              <div className="simple-stat">
                <span>{t.headingOffset}</span>
                <strong>
                  {typeof mapCalibration.headingOffset === 'number'
                    ? `${Math.round(mapCalibration.headingOffset)} deg`
                    : t.directionWaiting}
                </strong>
              </div>
            </div>

            <div className="coord-pill muted-pill">
              {typeof mapCalibration.headingOffset === 'number' ? t.directionReady : t.directionWaiting}
            </div>
          </motion.div>

          {role === 'uploader' && bgImage && (
            <>
              <motion.div
                className="admin-dock"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
              >
                <button
                  className={`glass-tool ${isPlacingTask ? 'active' : ''}`}
                  onClick={() => {
                    setIsPlacingTask((current) => !current);
                    setIsCalibratingMap(false);
                    setMapCalibration((current) => ({ ...current, targets: [], targetsLocked: false }));
                  }}
                >
                  <Plus size={16} />
                  {t.addTask}
                </button>
                <button
                  className={`glass-tool ${isCalibratingMap ? 'active' : ''}`}
                  onClick={() => {
                    setIsCalibratingMap((current) => !current);
                    setIsPlacingTask(false);
                    resetTaskForm();
                  }}
                >
                  <MapPinned size={16} />
                  {t.calibrateMap}
                </button>
                <button className="glass-tool" onClick={() => fileInputRef.current?.click()}>
                  <ImageIcon size={16} />
                  {t.replaceBaseMap}
                </button>
                <button className={`glass-tool ${heatmapMode ? 'active' : ''}`} onClick={() => setHeatmapMode((value) => !value)}>
                  <Waves size={16} />
                  {t.heatmap}
                </button>
                <button className="glass-tool" onClick={clearMapImage}>
                  <Trash2 size={16} />
                  {t.clearMap}
                </button>
                <div className="hint-copy">
                  {t.dockHint}
                </div>
              </motion.div>

              <motion.div
                className="calibration-panel simplified-calibration-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <div className="panel-title-row">
                  <div>
                    <span className="eyebrow">{t.mapCalibration}</span>
                    <h3>{t.calibrationSteps}</h3>
                  </div>
                  <div className="simple-status-badges">
                    <button
                      className={`ghost-pill compact ${calibrationMode === 'single' ? 'active-chip' : ''}`}
                      onClick={() => {
                        setCalibrationMode('single');
                        setMapCalibration((current) => ({ ...current, targets: [], targetsLocked: false }));
                      }}
                    >
                      {t.singleMode}
                    </button>
                    <button
                      className={`ghost-pill compact ${calibrationMode === 'batch' ? 'active-chip' : ''}`}
                      onClick={() => {
                        setCalibrationMode('batch');
                        setMapCalibration((current) => ({ ...current, targets: [], targetsLocked: false }));
                      }}
                    >
                      {t.batchMode}
                    </button>
                    <button className="ghost-pill compact" onClick={clearCalibration}>
                      {t.resetAnchors}
                    </button>
                  </div>
                </div>

                <p className="detail-description calibration-copy">{t.calibrationHint}</p>

                <div className="simple-calibration-steps">
                  <div className={`simple-step ${mapCalibration.targets.length > 0 ? 'done' : ''}`}>
                    <span>1</span>
                    <strong>{mapCalibration.targets.length > 0 ? `${t.targetsPlanned}: ${mapCalibration.targets.length}` : t.chooseTarget}</strong>
                  </div>
                  <div className={`simple-step ${activePlannedTarget ? 'done' : ''}`}>
                    <span>2</span>
                    <strong>{t.captureCurrent}</strong>
                  </div>
                  <div className={`simple-step ${mapCalibration.anchors.length >= 3 ? 'done' : ''}`}>
                    <span>3</span>
                    <strong>{t.doneAnchor}: {mapCalibration.anchors.length}</strong>
                  </div>
                </div>

                <div className="simple-target-card">
                  <div>
                    <span>{t.nextAnchorName}</span>
                    <strong>{activePlannedTarget?.label || anchorLabel || `${t.anchorLabel} ${mapCalibration.anchors.length + 1}`}</strong>
                  </div>
                  <div>
                    <span>{t.currentStep}</span>
                    <strong>
                      {mapCalibration.targets.length > 0
                        ? `${Math.min(currentTargetIndex + 1, mapCalibration.targets.length)} / ${mapCalibration.targets.length}`
                        : '--'}
                    </strong>
                  </div>
                  <div>
                    <span>{t.currentTarget}</span>
                    <strong>
                      {activePlannedTarget
                        ? `${activePlannedTarget.mapX.toFixed(1)}%, ${activePlannedTarget.mapY.toFixed(1)}%`
                        : t.chooseTarget}
                    </strong>
                  </div>
                </div>

                <div className="simple-actions">
                  {calibrationMode === 'batch' && !mapCalibration.targetsLocked ? (
                    <button className="ghost-pill compact" onClick={lockCalibrationTargets} disabled={mapCalibration.targets.length < 3}>
                      {t.finishTargets}
                    </button>
                  ) : (
                    <button className="ghost-pill compact" type="button">
                      {t.dragBlueDot}
                    </button>
                  )}
                  <button className="ghost-pill compact" onClick={exportCalibrationFile} disabled={mapCalibration.anchors.length === 0}>
                    {t.exportCalibration}
                  </button>
                  <button className="primary-pill compact" onClick={submitAnchor} disabled={!activePlannedTarget}>
                    <MapPinned size={16} />
                    {t.captureCurrent}
                  </button>
                </div>

                {mapCalibration.targets.length > 0 && (
                  <div className="simple-anchor-strip">
                    {mapCalibration.targets.map((target, index) => (
                      <button key={target.id} className={`mini-anchor-pill ${index < mapCalibration.anchors.length ? 'done' : ''}`}>
                        {index + 1}. {target.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}

          {bgImage && (
            <div className="mobile-app-shell">
              <div className="mobile-sheet">
                <div className="mobile-sheet-head">
                  <span className="eyebrow">{t.appTitle}</span>
                  <strong>
                    {mobileTab === 'capture'
                      ? t.livePosition
                      : mobileTab === 'calibrate'
                        ? t.mapCalibration
                        : t.taskTab}
                  </strong>
                </div>

                {mobileTab === 'capture' && (
                  <div className="mobile-sheet-body">
                    <div className="mobile-stat-grid">
                      <div className="mobile-stat-card">
                        <span>{t.worldX}</span>
                        <strong>{liveWorldX}</strong>
                      </div>
                      <div className="mobile-stat-card">
                        <span>{t.worldY}</span>
                        <strong>{liveWorldY}</strong>
                      </div>
                      <div className="mobile-stat-card">
                        <span>{t.headingOffset}</span>
                        <strong>
                          {typeof mapCalibration.headingOffset === 'number'
                            ? `${Math.round(mapCalibration.headingOffset)} deg`
                            : t.directionWaiting}
                        </strong>
                      </div>
                    </div>
                    <div className="mobile-action-row">
                      <button className={`glass-tool compact ${trackingEnabled ? 'active' : ''}`} onClick={() => setTrackingEnabled((value) => !value)}>
                        <Crosshair size={15} />
                        {trackingEnabled ? t.tracking : t.useGps}
                      </button>
                      <button className="ghost-pill compact" onClick={handleInstallApp} disabled={!installPromptEvent}>
                        {t.installApp}
                      </button>
                      <button className="primary-pill compact" onClick={submitAnchor} disabled={!activePlannedTarget}>
                        <MapPinned size={16} />
                        {t.captureCurrent}
                      </button>
                    </div>
                    {captureLogs.length > 0 && (
                      <div className="mobile-history">
                        <span className="eyebrow">{t.captureHistory}</span>
                        <div className="mobile-history-list">
                          {captureLogs.map((entry) => (
                            <div key={entry.id} className="mobile-history-item">
                              <strong>{entry.title}</strong>
                              <span>{entry.detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {mobileTab === 'calibrate' && (
                  <div className="mobile-sheet-body">
                    <div className="mobile-chip-row">
                      <button
                        className={`ghost-pill compact ${calibrationMode === 'single' ? 'active-chip' : ''}`}
                        onClick={() => {
                          setCalibrationMode('single');
                          setMapCalibration((current) => ({ ...current, targets: [], targetsLocked: false }));
                        }}
                      >
                        {t.singleMode}
                      </button>
                      <button
                        className={`ghost-pill compact ${calibrationMode === 'batch' ? 'active-chip' : ''}`}
                        onClick={() => {
                          setCalibrationMode('batch');
                          setMapCalibration((current) => ({ ...current, targets: [], targetsLocked: false }));
                        }}
                      >
                        {t.batchMode}
                      </button>
                      <button className={`ghost-pill compact ${isCalibratingMap ? 'active-chip' : ''}`} onClick={() => setIsCalibratingMap((value) => !value)}>
                        {t.calibrateMap}
                      </button>
                    </div>
                    <div className="mobile-progress-card">
                      <span>{t.currentStep}</span>
                      <strong>
                        {mapCalibration.targets.length > 0
                          ? `${Math.min(currentTargetIndex + 1, mapCalibration.targets.length)} / ${mapCalibration.targets.length}`
                          : '--'}
                      </strong>
                      <p>{t.calibrationHint}</p>
                    </div>
                    <div className="mobile-action-row">
                      {calibrationMode === 'batch' && !mapCalibration.targetsLocked ? (
                        <button className="ghost-pill compact" onClick={lockCalibrationTargets} disabled={mapCalibration.targets.length < 3}>
                          {t.finishTargets}
                        </button>
                      ) : (
                        <button className="ghost-pill compact" type="button">
                          {t.dragBlueDot}
                        </button>
                      )}
                      <button className="ghost-pill compact" onClick={exportCalibrationFile} disabled={mapCalibration.anchors.length === 0}>
                        {t.exportCalibration}
                      </button>
                    </div>
                    {mapCalibration.targets.length > 0 && (
                      <div className="mobile-anchor-list">
                        {mapCalibration.targets.map((target, index) => (
                          <div key={target.id} className={`mobile-anchor-item ${index < mapCalibration.anchors.length ? 'done' : ''}`}>
                            <span>{index + 1}</span>
                            <strong>{target.label}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {mobileTab === 'tasks' && (
                  <div className="mobile-sheet-body">
                    <div className="mobile-stat-grid">
                      <div className="mobile-stat-card">
                        <span>{t.live}</span>
                        <strong>{pendingTasks.length}</strong>
                      </div>
                      <div className="mobile-stat-card">
                        <span>{t.completed}</span>
                        <strong>{completedCount}</strong>
                      </div>
                      <div className="mobile-stat-card">
                        <span>{t.anchors}</span>
                        <strong>{mapCalibration.anchors.length}</strong>
                      </div>
                    </div>
                    <div className="mobile-action-grid">
                      <button className={`glass-tool compact ${isPlacingTask ? 'active' : ''}`} onClick={() => setIsPlacingTask((value) => !value)}>
                        <Plus size={16} />
                        {t.addTask}
                      </button>
                      <button className={`glass-tool compact ${heatmapMode ? 'active' : ''}`} onClick={() => setHeatmapMode((value) => !value)}>
                        <Waves size={16} />
                        {t.heatmap}
                      </button>
                      <button className="glass-tool compact" onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon size={16} />
                        {t.replaceBaseMap}
                      </button>
                      <button className="glass-tool compact warning" onClick={clearMapImage}>
                        <Trash2 size={16} />
                        {t.clearMap}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mobile-tabbar">
                <button className={`mobile-tab ${mobileTab === 'capture' ? 'active' : ''}`} onClick={() => setMobileTab('capture')}>
                  <Crosshair size={18} />
                  <span>{t.captureTab}</span>
                </button>
                <button className={`mobile-tab ${mobileTab === 'calibrate' ? 'active' : ''}`} onClick={() => setMobileTab('calibrate')}>
                  <MapPinned size={18} />
                  <span>{t.calibrateTab}</span>
                </button>
                <button className={`mobile-tab ${mobileTab === 'tasks' ? 'active' : ''}`} onClick={() => setMobileTab('tasks')}>
                  <Plus size={18} />
                  <span>{t.taskTab}</span>
                </button>
              </div>
            </div>
          )}

          {showTaskForm && (
            <motion.div
              className="publisher-sheet"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 250, damping: 24 }}
            >
              <div className="sheet-header">
                <div>
                  <span className="eyebrow">{t.rapidPublish}</span>
                  <h3>{t.plantTask}</h3>
                </div>
                <button className="icon-glass-btn small" onClick={resetTaskForm} aria-label="Close">
                  <ChevronDown size={18} />
                </button>
              </div>

              <div className="publisher-grid">
                <label>
                  <span>{t.title}</span>
                  <input
                    value={taskTitle}
                    autoFocus
                    onChange={(event) => setTaskTitle(event.target.value)}
                    placeholder="Library flash, relay call, lost and found..."
                  />
                </label>
                <label>
                  <span>{t.description}</span>
                  <textarea
                    rows="3"
                    value={taskDesc}
                    onChange={(event) => setTaskDesc(event.target.value)}
                    placeholder="Keep it short, warm, and easy to scan in three seconds."
                  />
                </label>
                <label>
                  <span>{t.deadline}</span>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                  />
                </label>
              </div>

              <div className="type-row">
                {TASK_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className={`type-chip ${taskType === type.id ? 'selected' : ''}`}
                    onClick={() => setTaskType(type.id)}
                  >
                    <type.icon size={15} />
                    {getLocaleLabel(type.label, locale)}
                  </button>
                ))}
              </div>

              <div className="sheet-actions">
                <button className="ghost-pill" onClick={resetTaskForm}>
                  {t.cancel}
                </button>
                <button className="primary-pill" onClick={submitTask}>
                  <Plus size={16} />
                  {t.publishToMap}
                </button>
              </div>
            </motion.div>
          )}

        </div>

        <AnimatePresence>
          {selectedTask && (
            <motion.div
              className="bottom-sheet-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bottom-sheet"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                exit={{ y: '110%' }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 260 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 120) setSelectedTask(null);
                }}
                transition={{ type: 'spring', stiffness: 250, damping: 28 }}
              >
                <div className="sheet-grabber" />
                <div className="detail-header">
                  <div>
                    <span className="eyebrow">{getLocaleLabel(getTaskTypeMeta(selectedTask.type).label, locale)}</span>
                    <h3>{selectedTask.title}</h3>
                  </div>
                  <span className={`task-status ${selectedTask.status === 'completed' ? 'done' : ''}`}>
                    {selectedTask.status === 'completed' ? t.completed : t.active}
                  </span>
                </div>

                <div className="detail-grid">
                  <div className="detail-card">
                    <span>{t.organizer}</span>
                    <strong>{selectedTask.organizer || 'Campus Ops'}</strong>
                  </div>
                  <div className="detail-card">
                    <span>{t.starts}</span>
                    <strong>{formatDateTime(selectedTask.startTime)}</strong>
                  </div>
                  <div className="detail-card highlight">
                    <span>{t.status}</span>
                    <strong>{selectedTask.countdown || t.waiting}</strong>
                  </div>
                </div>

                <p className="detail-description">
                  {selectedTask.description || 'This point is ready for action, even if more details have not arrived yet.'}
                </p>

                <div className="detail-actions">
                  <button className="ghost-pill" onClick={() => setSelectedTask(null)}>
                    {t.swipeDown}
                  </button>
                  {role === 'uploader' && (
                    <button className="ghost-pill warning" onClick={() => removeTask(selectedTask.id)}>
                      {t.deleteTask}
                    </button>
                  )}
                  <button className="primary-pill" onClick={() => toggleTaskComplete(selectedTask.id)}>
                    <CheckCircle2 size={16} />
                    {selectedTask.status === 'completed' ? t.restoreActive : t.acceptTask}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
