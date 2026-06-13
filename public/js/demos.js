/**
 * SPADE Interactive Agent Demos
 *
 * This script visualizes agent communication examples from demos.json using vis.js.
 * It shows nodes exchanging messages according to the definitions in the JSON.
 */

// Global variables for demo state
let network = null;
let nodes = null;
let edges = null;
let demoData = null;
let currentDemo = null;
let animationInterval = null;
let animationActive = false;
let messageEdges = [];
let messageCounter = 0;
let currentAnimationSpeed = 1000; // milliseconds between messages
let activeMessages = []; // Array to store currently moving messages
let messageIdCounter = 0; // Counter for unique message IDs

// Initialize the demo when document is loaded
document.addEventListener("DOMContentLoaded", async function () {
  // Exit silently on pages without the interactive demo section
  if (!document.getElementById("agent-network")) {
    return;
  }

  console.log("DOMContentLoaded - Starting demo initialization...");

  // Wait for demo data to be loaded
  let waitCount = 0;
  const maxWait = 50; // 5 seconds max wait

  while (!window.demoData && waitCount < maxWait) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    waitCount++;
  }

  if (window.demoData) {
    console.log("Demo data found:", window.demoData);
    // Initialize the network visualization
    initializeDemo();

    // Setup event listeners for controls
    setupEventListeners();

    // Load the first demo by default
    if (window.demoData.demos && window.demoData.demos.length > 0) {
      await loadDemo(window.demoData.demos[0].id);
    }
  } else {
    console.error("Demo data not loaded after waiting");
  }
});

/**
 * Initialize the demo visualization area
 */
function initializeDemo() {
  console.log("Initializing Agent Demo with vis.js...");

  // Get the container element
  const container = document.getElementById("agent-network");
  if (!container) {
    console.error("Container element not found");
    return;
  }

  // Create empty datasets
  nodes = new vis.DataSet([]);
  edges = new vis.DataSet([]);

  // Create network visualization
  const data = { nodes, edges };
  const options = {
    nodes: {
      shape: "dot",
      size: 25,
      font: {
        size: 14,
        face: "Tahoma",
      },
      borderWidth: 2,
      shadow: true,
    },
    edges: {
      width: 2,
      shadow: true,
      smooth: {
        type: "continuous",
      },
      arrows: {
        to: { enabled: true, scaleFactor: 0.5 },
      },
    },
    physics: {
      stabilization: true,
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0.1,
        springLength: 150,
        springConstant: 0.05,
        damping: 0.09,
      },
    },
    interaction: {
      hover: true,
      tooltipDelay: 200,
    },
  };

  // Initialize the network
  network = new vis.Network(container, data, options);

  // Add event listeners for network view changes
  network.on("zoom", handleNetworkViewChange);
  network.on("dragEnd", handleNetworkViewChange);
  network.on("viewChange", handleNetworkViewChange);

  // Log completion
  console.log("Agent Demo initialized with vis.js");
}

/**
 * Setup event listeners for the demo controls
 */
function setupEventListeners() {
  console.log("Setting up event listeners...");

  // Demo scenario selector
  const scenarioSelect = document.getElementById("demo-scenario");
  if (scenarioSelect) {
    // Clear existing options first
    scenarioSelect.innerHTML = "";

    // Populate the scenario selector from demos.json
    if (window.demoData && window.demoData.demos) {
      window.demoData.demos.forEach((demo) => {
        const option = document.createElement("option");
        option.value = demo.id;
        option.textContent = demo.name;
        scenarioSelect.appendChild(option);
      });
    }

    // Add change event listener
    scenarioSelect.addEventListener("change", function () {
      loadDemo(this.value);
    });
  } else {
    console.error("Scenario select element not found");
  }

  // Start/pause button
  const startButton = document.getElementById("start-demo");
  if (startButton) {
    startButton.addEventListener("click", function () {
      toggleAnimation();
    });
  }

  // Reset button
  const resetButton = document.getElementById("reset-demo");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      resetDemo();
    });
  }

  // Toggle code view button
  const toggleCodeButton = document.getElementById("toggle-code");
  if (toggleCodeButton) {
    toggleCodeButton.addEventListener("click", function () {
      toggleCodeView();
    });
  }

  // Collapse code button
  const collapseCodeButton = document.getElementById("collapse-code");
  if (collapseCodeButton) {
    collapseCodeButton.addEventListener("click", function () {
      const codeContainer = document.getElementById("code-container");
      if (codeContainer) {
        if (codeContainer.style.display === "none") {
          codeContainer.style.display = "block";
          this.innerHTML = '<i class="bi bi-chevron-up"></i>';
        } else {
          codeContainer.style.display = "none";
          this.innerHTML = '<i class="bi bi-chevron-down"></i>';
        }
      }
    });
  }
}

/**
 * Load a specific demo by ID
 * @param {string} demoId - The ID of the demo to load
 */
async function loadDemo(demoId) {
  console.log("Loading demo:", demoId);

  if (!window.demoData || !window.demoData.demos) {
    console.error("Demo data not loaded");
    return;
  }

  // Find the demo by ID
  const demo = window.demoData.demos.find((d) => d.id === demoId);
  if (!demo) {
    console.error(`Demo with ID ${demoId} not found`);
    return;
  }

  // Stop any ongoing animation
  stopAnimation();

  // Update current demo reference
  currentDemo = demo;

  // Update the demo description
  const demoDescElement = document.getElementById("demo-description");
  if (demoDescElement) {
    demoDescElement.textContent = demo.description;
  }

  // Update the status text
  updateStatusText("Ready");

  // Update the Start button text
  const startButton = document.getElementById("start-demo");
  if (startButton) {
    startButton.innerHTML =
      '<i class="bi bi-play-fill"></i> <span class="d-none d-sm-inline">Start</span>';
  }

  // Update selected tab in code examples
  const tabLink = document.querySelector(
    `#codeExampleTabs a[href="#${demoId}-code"]`
  );
  if (tabLink) {
    tabLink.click();
  }

  // Load Python code if needed
  if (typeof window.updateTabWithCode === "function") {
    await window.updateTabWithCode(demo);
  }

  // Reset and load the network visualization
  resetNetwork();
  loadNetwork(demo);
}

/**
 * Load the network visualization for a demo
 * @param {Object} demo - The demo data to visualize
 */
function loadNetwork(demo) {
  console.log("Loading network for demo:", demo.id);

  if (!demo || !demo.nodes || !demo.edges) {
    console.error("Invalid demo data");
    return;
  }

  // Get agent type definitions
  const agentTypes = window.demoData.agentTypes || {};

  // Create nodes for the visualization
  const nodeData = demo.nodes.map((node) => {
    const typeInfo = agentTypes[node.type] || {
      color: "#808080",
      size: 25,
      label: node.type,
      icon: "agent",
    };

    return {
      id: node.id,
      label: node.id,
      title: `${typeInfo.label || node.type}: ${node.id}`,
      x: node.position.x,
      y: node.position.y,
      color: {
        background: typeInfo.color,
        border: shadeColor(typeInfo.color, -20),
        highlight: {
          background: shadeColor(typeInfo.color, 20),
          border: shadeColor(typeInfo.color, -30),
        },
      },
      size: typeInfo.size,
      font: {
        color: getContrastColor(typeInfo.color),
      },
      fixed: {
        x: true,
        y: true,
      },
      behaviors: node.behaviors,
      shape: "dot",
    };
  });

  // Create edges for the visualization
  const edgeData = demo.edges.map((edge) => {
    let color = "#808080";
    let width = 2;
    let dashes = false;

    // Set edge style based on type
    switch (edge.type) {
      case "message":
        color = "#4CAF50";
        break;
      case "command":
        color = "#FF9800";
        width = 3;
        break;
      case "task":
        color = "#9C27B0";
        break;
      case "presence":
        color = "#00BCD4";
        dashes = [5, 5];
        break;
      case "status":
        color = "#F44336";
        dashes = [2, 2];
        break;
      case "publish":
        color = "#8BC34A";
        width = 3;
        break;
      case "deliver":
        color = "#3F51B5";
        break;
      case "request":
        color = "#607D8B";
        break;
      case "response":
        color = "#795548";
        break;
      case "prompt":
        color = "#17A2B8";
        width = 3;
        break;
      default:
        color = "#808080";
    }

    return {
      id: `${edge.from}-${edge.to}`,
      from: edge.from,
      to: edge.to,
      label: edge.type,
      color: {
        color: color,
        highlight: shadeColor(color, 20),
        hover: shadeColor(color, 10),
      },
      width: width,
      dashes: dashes,
      type: edge.type,
    };
  });

  console.log("Adding nodes:", nodeData.length);
  console.log("Adding edges:", edgeData.length);
  console.log("Node data:", nodeData); // Debug log to see all nodes

  // Add nodes and edges to the network
  nodes.add(nodeData);
  edges.add(edgeData);

  // Store original edges for animation
  messageEdges = [...edgeData];

  // Fit the network to view
  if (network) {
    network.fit();
  }
}

/**
 * Reset the network visualization
 */
function resetNetwork() {
  if (nodes) nodes.clear();
  if (edges) edges.clear();
  messageEdges = [];
  messageCounter = 0;
  cleanupActiveMessages();
}

/**
 * Toggle animation start/pause
 */
function toggleAnimation() {
  const startButton = document.getElementById("start-demo");

  if (!animationActive) {
    // Start animation
    startAnimation();
    if (startButton) {
      startButton.innerHTML =
        '<i class="bi bi-pause-fill"></i> <span class="d-none d-sm-inline">Pause</span>';
    }
    updateStatusText("Running");
  } else {
    // Pause animation
    stopAnimation();
    if (startButton) {
      startButton.innerHTML =
        '<i class="bi bi-play-fill"></i> <span class="d-none d-sm-inline">Start</span>';
    }
    updateStatusText("Paused");
  }
}

/**
 * Start the animation sequence
 */
function startAnimation() {
  if (animationActive) return;

  animationActive = true;

  // Start animation interval
  animationInterval = setInterval(() => {
    if (messageEdges.length === 0) {
      // No message edges, do nothing
      return;
    }

    // Get the current demo ID
    const isNetworkDemo = currentDemo && currentDemo.id === "network";

    // Get the next message edge in the sequence
    const edge = messageEdges[messageCounter % messageEdges.length];
    messageCounter++;

    // Check if this is a broadcast in the network demo (sender to receivers)
    if (
      isNetworkDemo &&
      edge.from === "sender" &&
      edge.to.startsWith("receiver")
    ) {
      // Find all edges from sender to receivers and create them simultaneously
      const broadcastEdges = messageEdges.filter(
        (e) => e.from === "sender" && e.to.startsWith("receiver")
      );

      // Create all broadcast messages at once
      broadcastEdges.forEach((bEdge) => {
        createAnimatedMessage(bEdge);
      });
    } else {
      // Regular message animation for other cases
      createAnimatedMessage(edge);
    }
  }, currentAnimationSpeed);
}

/**
 * Stop the animation sequence
 */
function stopAnimation() {
  if (!animationActive) return;

  animationActive = false;

  // Clear the animation interval
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }

  // Clean up any active messages
  cleanupActiveMessages();
}

/**
 * Flash a node to indicate sending or receiving
 * @param {string} nodeId - The ID of the node to flash
 * @param {string} action - The action ('sending' or 'receiving')
 */
function flashNode(nodeId, action) {
  const node = nodes.get(nodeId);
  if (!node) return;

  const originalColor = node.color.background;
  const flashColor = action === "sending" ? "#FF9800" : "#4CAF50";

  // Flash the node
  nodes.update({
    id: nodeId,
    color: {
      background: flashColor,
      border: node.color.border,
      highlight: node.color.highlight,
    },
  });

  // Reset after a short delay
  setTimeout(() => {
    nodes.update({
      id: nodeId,
      color: {
        background: originalColor,
        border: node.color.border,
        highlight: node.color.highlight,
      },
    });
  }, 300);
}

/**
 * Reset the current demo
 */
function resetDemo() {
  // Stop any ongoing animation
  stopAnimation();

  // Clean up active messages
  cleanupActiveMessages();

  // Reset message counter
  messageCounter = 0;

  // Update the status text
  updateStatusText("Reset");

  // Update the Start button text
  const startButton = document.getElementById("start-demo");
  if (startButton) {
    startButton.innerHTML =
      '<i class="bi bi-play-fill"></i> <span class="d-none d-sm-inline">Start</span>';
  }

  // Reload the current demo
  if (currentDemo) {
    resetNetwork();
    loadNetwork(currentDemo);
  }
}

/**
 * Toggle the code view section
 */
function toggleCodeView() {
  const codeSection = document.getElementById("code-section");
  if (!codeSection) return;

  // Scroll to the code section
  codeSection.scrollIntoView({ behavior: "smooth" });
}

/**
 * Update the status text in the UI
 * @param {string} status - The status text to display
 */
function updateStatusText(status) {
  const statusText = document.getElementById("demo-status-text");
  if (statusText) {
    statusText.textContent = status;

    // Update the text class based on status
    statusText.className = "";
    switch (status) {
      case "Running":
        statusText.classList.add("text-success");
        break;
      case "Paused":
        statusText.classList.add("text-warning");
        break;
      case "Reset":
        statusText.classList.add("text-info");
        break;
      default:
        statusText.classList.add("text-muted");
    }
  }
}

/**
 * Utility function to shade a color
 * @param {string} color - Hex color code
 * @param {number} percent - Percentage to lighten (positive) or darken (negative)
 * @returns {string} - Modified hex color
 */
function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = parseInt((R * (100 + percent)) / 100);
  G = parseInt((G * (100 + percent)) / 100);
  B = parseInt((B * (100 + percent)) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = R > 0 ? R : 0;
  G = G > 0 ? G : 0;
  B = B > 0 ? B : 0;

  const RR =
    R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16);
  const GG =
    G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16);
  const BB =
    B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
}

/**
 * Get a contrasting text color (black/white) for a background color
 * @param {string} hexColor - Hex color code
 * @returns {string} - '#ffffff' or '#000000'
 */
function getContrastColor(hexColor) {
  // Remove # if present
  hexColor = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors and white for dark colors
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

/**
 * Get message color scheme based on message type
 * @param {string} messageType - The type of message
 * @returns {Object} - Color scheme object with gradient, shadow, and border
 */
function getMessageColor(messageType) {
  const colors = {
    message: {
      gradient: "linear-gradient(45deg, #4CAF50, #45a049)",
      shadow: "rgba(76, 175, 80, 0.6)",
      border: "#388E3C",
    },
    command: {
      gradient: "linear-gradient(45deg, #FF9800, #f57c00)",
      shadow: "rgba(255, 152, 0, 0.6)",
      border: "#E65100",
    },
    task: {
      gradient: "linear-gradient(45deg, #9C27B0, #7B1FA2)",
      shadow: "rgba(156, 39, 176, 0.6)",
      border: "#4A148C",
    },
    presence: {
      gradient: "linear-gradient(45deg, #00BCD4, #0097A7)",
      shadow: "rgba(0, 188, 212, 0.6)",
      border: "#006064",
    },
    status: {
      gradient: "linear-gradient(45deg, #F44336, #d32f2f)",
      shadow: "rgba(244, 67, 54, 0.6)",
      border: "#B71C1C",
    },
    publish: {
      gradient: "linear-gradient(45deg, #8BC34A, #689F38)",
      shadow: "rgba(139, 195, 74, 0.6)",
      border: "#33691E",
    },
    deliver: {
      gradient: "linear-gradient(45deg, #3F51B5, #303F9F)",
      shadow: "rgba(63, 81, 181, 0.6)",
      border: "#1A237E",
    },
    request: {
      gradient: "linear-gradient(45deg, #607D8B, #455A64)",
      shadow: "rgba(96, 125, 139, 0.6)",
      border: "#263238",
    },
    response: {
      gradient: "linear-gradient(45deg, #795548, #5D4037)",
      shadow: "rgba(121, 85, 72, 0.6)",
      border: "#3E2723",
    },
    default: {
      gradient: "linear-gradient(45deg, #3498db, #2980b9)",
      shadow: "rgba(52, 152, 219, 0.6)",
      border: "#1f4e79",
    },
  };

  return colors[messageType] || colors.default;
}

/**
 * Create an animated message ball that moves from one node to another
 * @param {Object} edge - The edge object containing from and to node IDs
 */
function createAnimatedMessage(edge) {
  if (!network || !nodes) return;

  // Get positions of the nodes
  const fromPosition = network.getPositions([edge.from])[edge.from];
  const toPosition = network.getPositions([edge.to])[edge.to];

  if (!fromPosition || !toPosition) return;

  // Flash the sending node
  flashNode(edge.from, "sending");

  // Get message color based on edge type
  const messageColor = getMessageColor(edge.type || "message");

  // Create message object
  const messageId = `msg_${messageIdCounter++}`;
  const message = {
    id: messageId,
    fromNode: edge.from,
    toNode: edge.to,
    startX: fromPosition.x,
    startY: fromPosition.y,
    endX: toPosition.x,
    endY: toPosition.y,
    currentX: fromPosition.x,
    currentY: fromPosition.y,
    startTime: Date.now(),
    duration: Math.max(800, currentAnimationSpeed * 0.8), // Message travel time
    element: null,
    color: messageColor,
    type: edge.type || "message",
  };

  // Create DOM element for the message ball
  const messageElement = document.createElement("div");
  messageElement.className = "message-ball";
  messageElement.style.cssText = `
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${messageColor.gradient};
    border-radius: 50%;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 0 8px ${messageColor.shadow};
    transition: none;
    border: 1px solid ${messageColor.border};
  `;

  // Get the network canvas container to append the message
  const networkContainer = document.getElementById("agent-network");
  if (networkContainer) {
    // Ensure the container has relative positioning for absolute positioned children
    if (getComputedStyle(networkContainer).position === "static") {
      networkContainer.style.position = "relative";
    }

    networkContainer.appendChild(messageElement);
    message.element = messageElement;
    activeMessages.push(message);

    // Start animating the message
    animateMessage(message);
  }
}

/**
 * Animate a message ball moving from source to destination
 * @param {Object} message - The message object to animate
 */
function animateMessage(message) {
  if (!message.element) return;

  const animate = () => {
    const elapsed = Date.now() - message.startTime;
    const progress = Math.min(elapsed / message.duration, 1);

    // Easing function for smooth movement
    const easedProgress = easeInOutCubic(progress);

    // Calculate current position
    message.currentX =
      message.startX + (message.endX - message.startX) * easedProgress;
    message.currentY =
      message.startY + (message.endY - message.startY) * easedProgress;

    // Get the network canvas position and scale
    const networkContainer = document.getElementById("agent-network");
    if (!networkContainer) return;

    const rect = networkContainer.getBoundingClientRect();
    const canvas = networkContainer.querySelector("canvas");
    if (!canvas) return;

    // Convert network coordinates to screen coordinates
    const scale = network.getScale();
    const viewPosition = network.getViewPosition();

    const screenX =
      (message.currentX - viewPosition.x) * scale + rect.width / 2;
    const screenY =
      (message.currentY - viewPosition.y) * scale + rect.height / 2;

    // Update message position
    message.element.style.left = screenX - 4 + "px";
    message.element.style.top = screenY - 4 + "px";

    // Continue animation or finish
    if (progress < 1 && animationActive) {
      requestAnimationFrame(animate);
    } else {
      // Message has arrived - create particle explosion before removing
      flashNode(message.toNode, "receiving");
      createParticleExplosion(message);
      // Small delay before removing the main message ball to let explosion start
      setTimeout(() => removeMessage(message), 50);
    }
  };

  // Start the animation
  requestAnimationFrame(animate);
}

/**
 * Create a particle explosion effect when a message reaches its destination
 * @param {Object} message - The message object that reached its destination
 */
function createParticleExplosion(message) {
  if (!message.element) return;

  const networkContainer = document.getElementById("agent-network");
  if (!networkContainer) return;

  // Get the final position of the message
  const finalX = parseFloat(message.element.style.left) + 5; // Center of the ball
  const finalY = parseFloat(message.element.style.top) + 5; // Center of the ball

  // Create 8-12 particles for more visible effect
  const particleCount = Math.floor(Math.random() * 5) + 8; // 8-12 particles
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "message-particle";

    // Random direction for explosion
    const angle =
      (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
    const velocity = 2 + Math.random() * 3; // Slightly increased velocity (2-5px)
    const size = 2.5 + Math.random() * 2; // Slightly bigger size 2.5-4.5px

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${message.color.gradient};
      border-radius: 50%;
      pointer-events: none;
      z-index: 1001;
      left: ${finalX}px;
      top: ${finalY}px;
      box-shadow: 0 0 6px ${message.color.shadow}, 0 0 2px rgba(255,255,255,0.8) inset;
      opacity: 1;
      transition: none;
      border: 1.5px solid ${message.color.border};
      filter: brightness(1.2) saturate(1.3);
    `;

    networkContainer.appendChild(particle);

    // Store particle data
    particles.push({
      element: particle,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      life: 1.0,
      decay: 0.04 + Math.random() * 0.02, // Slightly slower decay for better visibility (0.04-0.06)
    });
  }

  // Animate particles
  const animateParticles = () => {
    let activeParticles = 0;

    particles.forEach((particle) => {
      if (particle.life <= 0) return;

      // Update position
      const currentX = parseFloat(particle.element.style.left);
      const currentY = parseFloat(particle.element.style.top);

      particle.element.style.left = currentX + particle.vx + "px";
      particle.element.style.top = currentY + particle.vy + "px";

      // Apply gravity and friction
      particle.vy += 0.08; // Slightly more gravity for natural fall
      particle.vx *= 0.94; // Balanced friction
      particle.vy *= 0.94;

      // Update life and opacity
      particle.life -= particle.decay;
      particle.element.style.opacity = Math.max(0, particle.life);

      if (particle.life > 0) {
        activeParticles++;
      }
    });

    // Continue animation if particles are still alive
    if (activeParticles > 0) {
      requestAnimationFrame(animateParticles);
    } else {
      // Clean up particles
      particles.forEach((particle) => {
        if (particle.element && particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
      });
    }
  };

  // Start particle animation
  requestAnimationFrame(animateParticles);
}

/**
 * Remove a message from active messages and DOM
 * @param {Object} message - The message to remove
 */
function removeMessage(message) {
  if (message.element && message.element.parentNode) {
    message.element.parentNode.removeChild(message.element);
  }

  const index = activeMessages.indexOf(message);
  if (index > -1) {
    activeMessages.splice(index, 1);
  }
}

/**
 * Clean up all active messages
 */
function cleanupActiveMessages() {
  activeMessages.forEach((message) => {
    if (message.element && message.element.parentNode) {
      message.element.parentNode.removeChild(message.element);
    }
  });
  activeMessages = [];
}

/**
 * Easing function for smooth animation
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} - Eased progress value
 */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

/**
 * Handle network view changes to update message positions
 */
function handleNetworkViewChange() {
  // Update positions of active messages when network view changes
  activeMessages.forEach((message) => {
    if (message.element) {
      updateMessagePosition(message);
    }
  });
}

/**
 * Update a message's screen position based on current network view
 * @param {Object} message - The message to update
 */
function updateMessagePosition(message) {
  const networkContainer = document.getElementById("agent-network");
  if (!networkContainer || !message.element) return;

  const rect = networkContainer.getBoundingClientRect();
  const canvas = networkContainer.querySelector("canvas");
  if (!canvas) return;

  // Convert network coordinates to screen coordinates
  const scale = network.getScale();
  const viewPosition = network.getViewPosition();

  const screenX = (message.currentX - viewPosition.x) * scale + rect.width / 2;
  const screenY = (message.currentY - viewPosition.y) * scale + rect.height / 2;

  // Update message position
  message.element.style.left = screenX - 4 + "px";
  message.element.style.top = screenY - 4 + "px";
}

